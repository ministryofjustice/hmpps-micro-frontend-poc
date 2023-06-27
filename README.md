# HMPPS Micro-Frontend PoC 

This project is a test the feasibility of micro-frontend architecture within
HMPPS. There are a number of ways of implementing the architecture but this example 
focuses on a technology called Server Side Includes (SSI).

[This repository](https://github.com/ministryofjustice/hmpps-micro-frontend-poc) 
was thrown together as an example of deploying the 'container' frontend service.
An example of a service that provides a 'component' within the container's 
page is [provided here](https://github.com/ministryofjustice/hmpps-micro-frontend-poc).

The POC is deployed to our development environment and can be accessed at:
https://micro-frontend-poc-dev.hmpps.service.justice.gov.uk/prisoner/A1234AA

You will need to sign in using either an external or prison user via HMPPS Auth.
Make sure you include the `/prisoner/A1234AA` part of the URL above, you'll get 
redirected to DPS if you hit the root of the URL. The example page is stolen 
from the new [Prisoner Profile service](https://github.com/ministryofjustice/hmpps-prisoner-profile)
and demonstrates how the 'Overview' part of the page could be provided by an
entirely different frontend service, deployed independently of the container.

You can see exactly what the component is serving up by navigating directly
to https://micro-frontend-poc-component-dev.hmpps.service.justice.gov.uk/prisoner/A1234AA

## Running the proof of concept

This app runs via `docker compose`, ensure this is setup and then run:

```bash
docker compose up
```

Once this runs the nginx server will be running on `localhost:8080` with an example page on `localhost:8080/prisoner/12345`, you will have to navigate here after logging in.

## The Problem Statement

1. As the number of our frontend services grows, managing common components such
   as the header (inc. links for user management, caseload switching), footer 
   (inc. user feedback), navigation, notifications/alerts etc. becomes 
   increasingly difficult. These components should be as standard as possible 
   across our services to avoid a disjointed user experience as users navigate 
   across our services.
2. Services (such as the Prisoner Profile) that pull in data and logic that is 
   owned by different domains / teams struggle with ownership and prioritising 
   competing demands of the various teams.  There is the question of who should
   do the development of a feature, manage the production deployment and perform
   the BAU support.  We have struggled in the past with the core DPS frontend
   service when multiple teams have struggled with competing needs to get work
   deployed to production.

## A Potential Solution - Micro-Frontend Architecture

A definition taken from the [Martin Fowler page](https://martinfowler.com/articles/micro-frontends.html)
says it is:

> An architectural style where independently deliverable frontend applications 
> are composed into a greater whole

I think it could tackle both problems in the Problem Statement.

1. Common components could be injected into frontend applications using SSI. 
   Updates to these components could be rolled out across our services 
   immediately without downtime, with only one deployment.
2. Services such as the Prisoner Profile could delegate certain areas
   of the page to teams that own the data / domain to look after.

Clearly there are alternative approaches that need considering.  Currently 
we rely on the HMPPS Typescript Template to provide some consistency and
teams try to keep up to date with that to various degrees. This relies on
the resource and diligence of the service team to keep things up to date.
We could instead keep common components in a library and services pull in
the latest version. This is probably the simplest effective approach but
deploying a change across all services relies on each service updating
the library and deploying to production. User experience suffers whilst
this happens, especially for a major update in the library, and it
requires resource in each service team to deploy the change.

## A Potential Implementation - SSI

This particular PoC considers implementation using Server Side Includes,
using [this section](https://martinfowler.com/articles/micro-frontends.html#Server-sideTemplateComposition)
of the Martin Fowler site for inspiration.

We have made tech choices to minimise the need for client side JavaScript,
both because it is in keeping with [GDS advice](https://www.gov.uk/service-manual/technology/using-progressive-enhancement)
but also because of historic issues we've faced with supporting thin
clients in prisons where excessive JavaScript has overloaded the central
servers serving the thin clients. With this in mind I've first chosen to 
investigate a server side approach.

## Key Details of the Implementation

I have tried to find an approach that would need minimal changes to
the way service teams work currently.  This has led some of the decisions
here.

### AuthN / AuthZ 

In HMPPS we use the OAuth2 Authorization Code Flow to provide a user
token back to the frontend service.  The service typically stores the
user token in Redis and keeps an encrypted key in a cookie.  I have
assumed that we would need to protect the component endpoints with 
the same mechanism.  We would at the very least need to be able to 
pass context of the user to components such as the common header.

This raises perhaps the biggest / most disruptive issue. In this PoC,
the container service and the component service **share the same Redis
instance**. The container application completes the OAuth2 handshake,
and stores the user token in Redis. When the page with SSI is requested,
Nginx passes the cookie from the container service through
to the component service, and since both services can find the user 
session in the Redis instance, the component service considers the user 
to be signed in too.

I think the way we'd want to do this in practice is to have a shared
session store for keeping the user token.  We'd use a cookie that would
apply to all `.justice.gov.uk` sites.  Once a user signs in with one 
frontend application they are considered signed in everywhere else.
This wouldn't preclude services from keeping a separate session store
for things specific to their service.

We could replace the Token Verification API with this new service
since it would effectively be doing the same job.

It would also open the possibility of managing cross-service inactivity
timeouts as a side effect.

### Cloud Platform Environment

There is nothing about the Cloud Platform Environment setup that is
out of the ordinary.

### Helm Deployment

This PoC requires an [nginx container configured](/helm_deploy/hmpps-micro-frontend-poc/templates/ssi.yaml)
to allow SSI, and to direct traffic to the relevant service, dependent
on the URL. I've been able to use regex to pass through bits of the 
URL to the component service to provide it context from the container
service. This should be done within the [Generic Service Helm Chart](https://github.com/ministryofjustice/hmpps-helm-charts/tree/main/charts/generic-service)
and codified into the k8s deployment - I've done the bare minimum here
to prove it's possible.  Also probably what we would want to do
is put the nginx container and the 'container' frontend service within
the same pod, but that's a relatively minor detail.

This PoC also requires a [change to the ingress setup](/helm_deploy/hmpps-micro-frontend-poc/templates/ingress.yaml).
The ingress directs traffic to the nginx pod which in turn directs
traffic to the relevant service. 

### SSI Directives

The SSI directive in this PoC that pulls in the component HTML
is [here](/server/views/pages/index.njk):

```
<!--# include virtual="/component/prisoner/{{ prisonId }}" -->
```

### Separation of assets (e.g. images, JavaScript and CSS)

One thing we'd be keen on avoiding is conflicting CSS declarations.
This PoC shows we can avoid this by 'namespacing' the assets so that
the component assets can have urls prefixed by the component name, e.g.
`/my-component/assets/...` and the nginx rule loads the right asset.

## Potential Issues to Investigate Further

* SSI Injection - by turning SSI on we have to make sure that we
  don't fall vulnerable to SSI injection. We need to check Nunjucks 
  templating provides protection.
* More difficult to test the end product, we'd need integration tests
  to prove it all hangs together nicely
* Complexity of our architecture - this adds more complexity for 
  new developers to wrap their heads round
* ...
