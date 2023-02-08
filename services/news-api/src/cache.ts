const fs = require("fs");
const redis = require("redis");
const redisClient = redis.createClient({
  host: "redis",
  port: 6379,
});

// Method to get cached data from redis
export const getCache = (key: any) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err: any, reply: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
};

// Method to set cached data in redis
export const setCache = (key: string, value: string, expiryInSec: number) => {
  return new Promise((resolve, reject) => {
    redisClient.set(key, value, "EX", expiryInSec, (err: any, reply: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
};

// Method to delete cached data from redis
export const delCache = (key: string) => {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err: any, reply: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
};