import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-document-resolved', [
  {
    name: 'valid case AsyncAPI 3',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
    },
    errors: [],
  },
  {
    name: 'valid AsyncAPI 3.1 document with resolved references and ROS 2 bindings',
    document: {
      asyncapi: '3.1.0',
      info: {
        title: 'Turtle telemetry',
        version: '1.0.0',
      },
      servers: {
        development: {
          host: 'localhost',
          protocol: 'ros2',
          bindings: {
            ros2: {
              domainId: 0,
              rmwImplementation: 'rmw_fastrtps_cpp',
            },
          },
        },
      },
      channels: {
        turtlePose: {
          address: 'turtle/pose',
          messages: {
            TurtlePose: {
              payload: {
                type: 'object',
              },
            },
          },
        },
      },
      operations: {
        publishPose: {
          action: 'send',
          channel: {
            $ref: '#/channels/turtlePose',
          },
          messages: [{ $ref: '#/channels/turtlePose/messages/TurtlePose' }],
          bindings: {
            ros2: {
              node: '/turtlesim',
              role: 'publisher',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'AsyncAPI 3.0 rejects ROS 2 bindings that are introduced in 3.1',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Turtle telemetry',
        version: '1.0.0',
      },
      servers: {
        development: {
          host: 'localhost',
          protocol: 'ros2',
          bindings: {
            ros2: {
              domainId: 0,
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Property "ros2" is not expected to be here',
        path: ['servers', 'development', 'bindings', 'ros2'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid AsyncAPI 3.1 info property is missing',
    document: {
      asyncapi: '3.1.0',
    },
    errors: [{ message: 'Object must have required property "info"', severity: DiagnosticSeverity.Error }],
  },
  {
    name: 'valid future AsyncAPI 3.x document uses the latest known schema as fallback',
    document: {
      asyncapi: '3.2.0',
      info: {
        title: 'Future AsyncAPI document',
        version: '1.0.0',
      },
    },
    errors: [],
  },
  {
    name: 'invalid future AsyncAPI 3.x document is validated by the fallback schema',
    document: {
      asyncapi: '3.2.0',
    },
    errors: [{ message: 'Object must have required property "info"', severity: DiagnosticSeverity.Error }],
  },
  {
    name: 'valid case resolved case message',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
      channels: {
        SomeChannel: {
          address: 'users/{userId}/signedUp',
          messages: {
            SomeMessage: { $ref: '#/components/messages/SomeMessage' },
          },
        },
      },
      components: {
        messages: {
          SomeMessage: { payload: { type: 'string' } },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid AsyncAPI 3 info property is missing',
    document: {
      asyncapi: '3.0.0',
    },
    errors: [{ message: 'Object must have required property "info"', severity: DiagnosticSeverity.Error }],
  },
  {
    name: 'invalid AsyncAPI 3 resolved case message',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
      channels: {
        SomeChannel: {
          address: 'users/{userId}/signedUp',
          messages: {
            SomeMessage: { $ref: '#/x-SomeMessage' },
          },
        },
      },
      'x-SomeMessage': { test: 'test' },
    },
    errors: [
      {
        message: 'Property "test" is not expected to be here',
        severity: DiagnosticSeverity.Error,
        path: ['channels', 'SomeChannel', 'messages', 'SomeMessage', 'test'],
      },
    ],
  },
  {
    name: 'valid case (3.0.0 version)',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Signup service example (internal)',
        version: '0.1.0',
      },
      channels: {
        'user/signedup': {
          address: 'user/signedup',
          messages: {
            'subscribe.message': {
              payload: {},
            },
          },
        },
      },
      operations: {
        'user/signedup.subscribe': {
          action: 'send',
          channel: {
            address: 'user/signedup',
            messages: {
              'subscribe.message': {
                payload: {},
              },
            },
          },
          messages: [
            {
              payload: {},
            },
          ],
        },
      },
    },
    errors: [],
  },

  {
    name: 'invalid case for 3.0.0 (info.version property is missing)',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Valid AsyncApi document',
      },
    },
    errors: [
      {
        message: '"info" property must have required property "version"',
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'valid case for 3.X.X (case validating $ref resolution works as expected)',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Signup service example (internal)',
        version: '0.1.0',
      },
      channels: {
        userSignedup: {
          address: 'user/signedup',
          messages: {
            'subscribe.message': {
              $ref: '#/components/messages/testMessage',
            },
          },
        },
      },
      components: {
        messages: {
          testMessage: {
            payload: {},
          },
        },
      },
    },
    errors: [],
  },
]);
