# Arazzo Rules

Spectral has a built-in "arazzo" ruleset for the [Arazzo Specification](https://spec.openapis.org/arazzo/v1.0.0.html).

In your ruleset file you can add `extends: "spectral:arazzo"` and you'll get all of the following rules applied.

### arazzo-document-schema

Validate structure of an Arazzo Document against the schema of the Arazzo v1 specification.

**Recommended:** Yes

### arazzo-workflowId-unique

`workflowId` must be unique across all the workflows defined within an Arazzo Document.

**Recommended:** Yes

### arazzo-workflow-output-validation

Every workflow output must have unique name and its value must be a valid runtime expression.

Additionally, if output values use expressions like `$workflows.foo.steps.bar`, the rule will verify the existence of workflow `foo` and step `bar`.

**Recommended:** Yes

**Good Example**

```yaml
  // Assuming that `TokenStep` is a defined step and that it exposes an output of `tokenResponse`
  outputs:
    access_token: $steps.TokenStep.outputs.tokenResponse
```

**Bad Example**

```yaml
outputs:
  access_token: $foo
```

### arazzo-workflow-stepId-unique

Every `stepId` defined within a workflow must be unique

**Recommended:** Yes

**Good Example**

```yaml
workflows:
  - workflowId: someWorkflow
    parameters:
      - in: cookie
        name: workflowLevelParamOne
        value: someValue
      - in: header
        name: workflowLevelParamTwo
        value: someValue
    steps:
      - stepId: post-step
        parameters:
          - in: cookie
            name: foo
            value: some_value
        operationId: createResource
      - stepId: get-step
        operationId: getResource
```

**Bad Example**

```yaml
workflows:
  - workflowId: someWorkflow
    parameters:
      - in: cookie
        name: workflowLevelParamOne
        value: someValue
      - in: header
        name: workflowLevelParamTwo
        value: someValue
    steps:
      - stepId: post-step
        parameters:
          - in: cookie
            name: foo
            value: some_value
        operationId: createResource
      - stepId: post-step
        operationId: getResource
```

### arazzo-step-output-validation

Every step output must have unique name and its value must be a valid runtime expression.

Then validating the expression the rule checks against known prefixes described in the [Arazzo Specification Runtime Expressions](https://spec.openapis.org/arazzo/v1.0.0.html#runtime-expressions). Additionally, if output values use expressions like `$workflows.foo.steps.bar`, the rule will verify the existence of workflow `foo` and step `bar`.

**Recommended:** Yes

### arazzo-step-parameters-validation

Parameters must be unique based on their combination of `name` and `in` properties when defined at the workflow level or within a step. Step parameters can override workflow level parameters.

Additionally rule checks:

- reusable parameter references must be a valid Arazzo runtime expression (e.g. `$components.parameters.<name>`) and the referenced parameter must be existing within the components parameters
- parameter values using expressions, must be a valid Arazzo Specification Runtime Expressions](https://spec.openapis.org/arazzo/v1.0.0.html#runtime-expressions). Additionally, if parameter values use expressions like `$workflows.foo.steps.bar`, the rule will verify the existence of workflow `foo` and step `bar`.

**Recommended:** Yes

**Good Example**

```yaml
parameters:
  - name: username
    in: query
    value: $inputs.username
```

**Bad Example**

```yaml
parameters:
  - name: username
    in: query
    value: $foo
```

### arazzo-step-failure-actions-validation

Every failure action must have a unique `name`, and the fields `workflowId` and `stepId` are mutually exclusive. Any runtime expressions used for `workflowId` or `stepId` must be valid and resolve to a defined workflow or step respectively.

Additionally rule checks:

- reusable failure action references must be a valid Arazzo runtime expression (e.g. `$components.failureActions.<name>`) and the referenced action must be existing within the components parameters

**Recommended:** Yes

### arazzo-step-success-actions-validation

Every success action must have a unique `name`, and the fields `workflowId` and `stepId` are mutually exclusive. Any runtime expressions used for `workflowId` or `stepId` must be valid and resolve to a defined workflow or step respectively.

Additionally rule checks:

- reusable success action references must be a valid Arazzo runtime expression (e.g. `$components.successActions.<name>`) and the referenced action must be existing within the components parameters

**Recommended:** Yes

### arazzo-workflow-depends-on-validation

The list of defined workflows within the `dependsOn` property must be unique and must be valid (e.g. the runtime expression must resolve to a defined workflow).

**Recommended:** Yes

### arazzo-step-success-criteria-validation

Every success criteria must have a valid context, conditions, and types.

Rule checks:

- `condition` must be specified
- if `type` is defined then a `context` must be provided
- if `type` is an object then it must conform to an [Arazzo Specification Criterion Expression Type Object](https://spec.openapis.org/arazzo/v1.0.0.html#criterion-expression-type-object)
- if `type` is specified as "regex", then the condition must be a valid regex
- `context` must be a valid [Arazzo Specification Runtime Expressions](https://spec.openapis.org/arazzo/v1.0.0.html#runtime-expressions)

**Recommended:** Yes

**Good Example**

```yaml
- context: $statusCode
  condition: "^200$"
  type: regex
```

**Bad Example**

```yaml
- context: hello
  condition: "^200$"
  type: regex
```

### arazzo-step-validation

Every step must have a valid `stepId` and either a valid `operationId` or `operationPath` or `workflowId`. Defined runtime expressions are also validated.

**Recommended:** Yes

### arazzo-no-script-tags-in-markdown

This rule protects against a potential hack, for anyone bringing in Arazzo documents from third parties and then generating HTML documentation. If one of those third parties does something shady like injecting `<script>` tags, they could easily execute arbitrary code on your domain, which if it's the same as your main application could be all sorts of terrible.

**Recommended:** Yes

**Bad Example**

```yaml
arazzo: "1.0.0"
info:
  title: 'some title with <script>alert("You are Hacked");</script>',
```

### arazzo-info-description

Arazzo object info `description` must be present and non-empty string.

Examples can contain Markdown so you can really go to town with them, implementing getting started information like what the workflows contained can do and how you can get up and running.

**Recommended:** Yes

**Good Example**

```yaml
arazzo: 1.0.0
info:
  title: BNPL Workflow Description
  version: 1.0.0
  description: |
    ## Overview

    This workflow guides the process of applying for a loan at checkout using a "Buy Now, Pay Later" (BNPL) platform. It orchestrates a series of API interactions to ensure a seamless and efficient loan application process, integrating multiple services across different API providers.

    ### Key Features
    - **Multi-step Loan Application:** The workflow includes multiple steps to check product eligibility, retrieve terms and conditions, create customer profiles, initiate the loan, and finalize the payment plan.
    - **Dynamic Decision Making:** Based on the API responses, the workflow adapts the flow, for example, skipping customer creation if the customer is already registered or ending the workflow if no eligible products are found.
    - **User-Centric:** The workflow handles both existing and new customers, providing a flexible approach to customer onboarding and loan authorization.
```

### arazzo-source-descriptions-type

Source Description `type` should be present. This means that tooling does not need to immediately parse/resolve the `sourceDescriptions` to know what type of document they are.

**Recommended:** Yes

**Good Example**

```yaml
sourceDescriptions:
  - name: BnplApi
    url: https://raw.githubusercontent.com/OAI/Arazzo-Specification/main/examples/1.0.0/bnpl-openapi.yaml
    type: openapi
```

### arazzo-workflow-workflowId

Workflow `workflowId` defined should follow the pattern `^[A-Za-z0-9_\\-]+$`. This is good practice as tools and libraries can use the `workflowId` to uniquely identify a workflow.

**Recommended:** Yes

### arazzo-workflow-description

In order to improve consumer experience, Workflow `description` should be present and a non-empty string.

**Recommend:** Yes

### arazzo-workflow-summary

In order to improve consumer experience, Workflow `summary` should be present and a non-empty string.

**Recommend:** Yes

### arazzo-step-stepId

Step `stepId` defined should follow the pattern `^[A-Za-z0-9_\\-]+$`. This is good practice as tools and libraries can use the `stepId` to uniquely identify a step.

**Recommended:** Yes

### arazzo-step-description

In order to improve consumer experience, Step `description` should be present and a non-empty string.

**Recommend:** Yes

### arazzo-step-operationPath

It is recommended to use `operationId` rather than `operationPath` within a step to reference an API operation.

**Recommended:** Yes

### arazzo-step-request-body-validation

Every step request body must have an expected `contentType` and expected use of runtime expressions.

The contentType value will be checked against the following regex:

```regex
/^(application|audio|font|example|image|message|model|multipart|text|video)\/[a-zA-Z0-9!#$&^_.+-]{1,127}$/
```

Rule Checks:

- if `payload` uses full runtime expression (e.g. $steps.steps1.outputs.responseBody) then it must be a valid/expected runtime expression
- If `replacements` are specified, then if a `value` uses a runtime expression it must be valid.

> \_inline use of runtime expressions within `payload` are not yet validated

**Recommended:** Yes
