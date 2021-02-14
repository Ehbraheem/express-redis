# express-redis
Configuration based Redis client middleware for Express.

## Development setup

A quick guide to basic setup of the **express-redis** project on your local machine


## Redis installation

Redis can only be installed on Unix based systems (Mac OSX, and all linux variants) with addition of Windows 10's subsystem linux. Check the official documentation for details https://redis.io/download



## express-redis middleware options
There are 3 different connection `mode` supported by this middleware. `'regular' | 'sentinel' | 'cluster'`

### Regular mode options

```js
{
  mode: 'regular', // One of 'regular' | 'sentinel' | 'cluster' (Required)
  options: {
    port: 6379,
    host: "127.0.0.1", // Redis host
    options: {
      family: 4, // 4 (IPv4) or 6 (IPv6) (Optional)
      password: "auth", // If you have auth setup for your server (Optional)
      db: 0, // DB name to use (Optional)
    }
  }
}
```

### Sentinel mode options

```js
{
  mode: 'sentinel', // (Required)
  options: {
    sentinels: [ // List of sentinels to connect to (Required)
      { host: "localhost", port: 26379 },
      { host: "localhost", port: 26380 },
    ],
    name: "mymaster"
    role: "slave", // will return a random slave from the Sentinel group (Optional)
    family: 4, // 4 (IPv4) or 6 (IPv6) (Optional)
    sentinelPassword: "auth", // If you have auth setup for your server (Optional)
  }
}
```

### Cluster mode options

```js
{
  mode: 'cluster', // (Required)
  options: {
    nodes: [ // List of nodes to connect to (Required)
      { host: "localhost", port: 6380 },
      { host: "localhost", port: 6381 },
    ],
    options: {
      scaleReads: 'all' // Scale reads to the node with the specified role (Optional)
    }
  }
}
```

### PUB/SUB options
To avoid the event of blocking the redis instance connected to the server, all users of this plugin are required to set the below option for **pub/sub**.

#### Publisher option

```js
{
  mode: '', // MODE OF CHOICE. see below for examples
  publisherOption: true // false by default.
}
```

#### Subscriber options

```js
{
  subscriberOption: {
    subscribers: async () => console.log('Hello world'), // Function (Required)
    topics: [
      'LIST OF TOPICS'
    ]
  }
}
```

## Support
For more information on redis, here's a link to their [Official documentation](https://redis.io/documentation). For API documentation of the redis client driver used in this project, check their [documentation](https://github.com/luin/ioredis).
