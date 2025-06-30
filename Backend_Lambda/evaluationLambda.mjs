import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
//import { Readable } from "stream";

const s3 = new S3Client({ region: "eu-central-1" });

const BUCKET = "webdata-s3";
const FOLDER = "evaluation/";

//* File (bucket object) operations *//
// 1. Reading JSON file
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", chunk => chunks.push(chunk));
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
  console.log("File written to S3:", FOLDER + filename);
}

//* Data management *//
async function getEmployeesObj() {
  return await readJsonFromS3("employee.json");
}

async function getEvaluationsObj() {
  return await readJsonFromS3("evaluation.json");
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

// OK 204 No content (Deleted)
function okNoContentResponse() {
  return {
    statusCode: 204,
    headers: {
      "Content-Type": "application/json",
    },
    body: "",
  };
}

// Bad request
function badRequest(statusCode = 400, message = "Invalid request") {
  return {
    statusCode: statusCode,
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
export const handler = async event => {
  const rawPath = event.rawPath || "/";
  const routeParams = rawPath.split("/");
  const dataType = (routeParams[1] || "unknown").toLowerCase();
  const dataID = (routeParams[2] || "").toLowerCase();
  const httpMethod = event.requestContext?.http?.method || "unknown";

  try {
    // Criterion
    if (dataType === "criterion" && httpMethod === "GET") {
      const data = Object.assign(
        await readJsonFromS3("criterion.json"),
        await getEmployeesObj()
      );
      return okResponse(data);
      // Employee //
    } else if (dataType === "employee") {
      if (httpMethod === "POST") {
        const parsedBody = JSON.parse(event.body);
        const employee_id = parsedBody.employee_id || "";
        const empName = parsedBody.name || "";

        if (employee_id === "" || empName === "") {
          return badRequest(400, "Missing parameters");
        }

        const employeesObj = await getEmployeesObj();

        if (
          employeesObj.employees.some(emp => emp.employee_id === employee_id)
        ) {
          return postConflict();
        }

        const newEmployee = {
          employee_id: employee_id,
          name: empName,
          is_ready: false,
        };
        employeesObj.employees.push(newEmployee);
        await writeJsonToS3("employee.json", employeesObj);

        return okResponse(newEmployee, 201);
      } else if (httpMethod === "DELETE") {
        if (dataID === "") {
          return badRequest(400, "Missing parameters");
        }

        const employeesObj = await getEmployeesObj();
        let index = employeesObj.employees.findIndex(
          emp => emp.employee_id === dataID
        );
        if (index === -1) {
          return badRequest(404, "Not found");
        }
        employeesObj.employees.splice(index, 1);
        // Deleting the employee's evaluations
        const evaluationsObj = await getEvaluationsObj();
        index = evaluationsObj.evaluations.findIndex(
          eva => eva.employee_id === dataID
        );
        if (index !== -1) {
          evaluationsObj.evaluations.splice(index, 1);
          await writeJsonToS3("evaluation.json", evaluationsObj);
        }
        // Saving the employeesObj, too
        await writeJsonToS3("employee.json", employeesObj);

        return okNoContentResponse();
      }
      return badRequest(400, "Invalid method");
      // Evaluation //
    } else if (dataType === "evaluation") {
      if (httpMethod === "GET") {
        if (dataID === "") {
          return badRequest(400, "Missing parameters");
        }
        const evaluationsObj = await getEvaluationsObj();
        let index = evaluationsObj.evaluations.findIndex(
          eva => eva.employee_id === dataID
        );
        if (index === -1) {
          const employeesObj = await getEmployeesObj();
          index = employeesObj.employees.findIndex(
            emp => emp.employee_id === dataID
          );
          if (index === -1) return badRequest(404, "Not found");
          return okNoContentResponse();
        }
        return okResponse(evaluationsObj.evaluations[index]);
      } else if (httpMethod === "POST") {
        const parsedBody = JSON.parse(event.body);
        const employee_id = parsedBody.employee_id || "";
        const criteria = parsedBody.criteria || [];
        const is_ready = parsedBody.isready || false;

        if (employee_id === "" || criteria.length === 0) {
          return badRequest(400, "Missing parameters");
        }

        const employeesObj = await getEmployeesObj();
        let empIndex = employeesObj.employees.findIndex(
          emp => emp.employee_id === employee_id
        );
        if (empIndex === -1) return badRequest(404, "Not found");

        const newEvaluation = { employee_id, criteria, is_ready };
        const evaluationsObj = await getEvaluationsObj();
        const index = evaluationsObj.evaluations.findIndex(
          eva => eva.employee_id === employee_id
        );
        if (index === -1) {
          evaluationsObj.evaluations.push(newEvaluation);
        } else {
          employeesObj.evaluations[index] = newEvaluation;
        }
        await writeJsonToS3("evaluation.json", evaluationsObj);
        return okResponse(newEvaluation, 201);
      }

      return badRequest(400, "Invalid method");
      // Other //
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
