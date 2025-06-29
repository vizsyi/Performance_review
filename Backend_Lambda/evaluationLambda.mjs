import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

const s3 = new S3Client({ region: "eu-central-1" });

const BUCKET = "webdata-s3";
const FOLDER = "evaluation/";

//* File (bucket object) operations *//
// 1. Reading JSON file
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}

async function readJsonFromS3(filename) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: FOLDER + filename,
  });
  const response = await s3.send(command);
  const jsonString = await streamToString(response.Body);
  const data = JSON.parse(jsonString);
  return data;
}

// 2. Writing JSON file
async function writeJsonToS3(filename, jsonData) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: FOLDER + filename,
    Body: JSON.stringify(jsonData, null, 2), // formázott JSON
    ContentType: "application/json",
  });

  await s3.send(command);
  console.log("JSON fájl sikeresen elmentve S3-ba.");
}

//* Data management *//

//* Response functions *//
// Bad request
function badRequest(message = "Invalid request") {
  return {
    statusCode: 400,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
    }),
  };
}

//* Serverless server *//
export const handler = async (event) => {
  const rawPath = event.rawPath || "/";
  const routeParams = rawPath.split("/");
  const dataType = (routeParams[1] || "unknown").toLowerCase();
  const httpMethod = event.requestContext?.http?.method || "unknown";

  try {
    if (dataType === "criterion" && httpMethod === "GET") {
      const data = await readJsonFromS3("criterion.json");
      const response = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Ok!",
          data: data,
        }),
      };
      return response;
    } else {
      return badRequest();
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error",
        error: error.message,
      }),
    };
  }
};
