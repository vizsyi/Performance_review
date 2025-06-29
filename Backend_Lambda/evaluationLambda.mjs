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
  //console.log("File written to S3:", FOLDER + filename);
}

//* Data management *//
async function getEmployeesObj() {
  return await readJsonFromS3("employee.json");
}

//* Response functions *//
// OK 200, 201
function okResponse(data, statusCode = 200) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Ok!",
      data: data,
    }),
  };
}

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

// Conflict 409
function postConflict() {
  return {
    statusCode: 409,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Object already exists",
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
      const data = Object.assign(
        await readJsonFromS3("criterion.json"),
        await getEmployeesObj()
      );

      return okResponse(data);
    } else if (dataType === "employee") {
      if (httpMethod === "POST") {
        const parsedBody = JSON.parse(event.body);
        const empID = parsedBody.employee_id || "";
        const empName = parsedBody.name || "";

        if (empID === "" || empName === "") {
          return badRequest("Missing parameters");
        }

        const employeesObj = await getEmployeesObj();

        if (employeesObj.employees.some((emp) => emp.id === empID)) {
          return postConflict();
        }

        const newEmployee = {
          id: empID,
          name: empName,
          is_ready: false,
        };
        employeesObj.employees.push(newEmployee);
        await writeJsonToS3("employee.json", employeesObj);

        return okResponse(newEmployee, 201);
      }
      return badRequest("Invalid method");
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
