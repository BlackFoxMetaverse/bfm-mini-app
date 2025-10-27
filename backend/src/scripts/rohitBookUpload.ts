import fs from "fs";
import path from "path";
import AWS from "aws-sdk";
import mongoose from "mongoose";
import * as XLSX from "xlsx";
import { Book } from "../models/Book.model";

// --- AWS S3 CONFIG ---
AWS.config.update({
  accessKeyId: "",
  secretAccessKey: "",
  region: "",
});
const s3 = new AWS.S3();
const BUCKET_NAME = "invincible-mini-app";

// --- MongoDB ---
mongoose.connect(
  "mongo url"
);

// --- Read Excel Sheet ---
const workbook = XLSX.readFile(path.join(__dirname, "Sheet3.xlsx"));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet);

// --- Upload File to S3 ---
const uploadToS3 = async (filePath: string, key: string): Promise<string> => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
  };
  const res = await s3.upload(params).promise();
  return res.Location;
};

// --- Main Logic ---
const uploadAll = async () => {
  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i] as any;

    const sno = item["SNO"]; 
    const rawTitle = item["BOOK NAMES"];
    const rawDescription = item["DESCRIPTION"];

    const title =
      typeof rawTitle === "string"
        ? rawTitle.trim()
        : String(rawTitle || "").trim();
    const description =
      typeof rawDescription === "string"
        ? rawDescription.trim()
        : String(rawDescription || "").trim();

    if (!title) {
      console.warn(`Skipping SNO ${sno}: Missing title`);
      continue;
    }

    if (!description) {
      console.log(`SNO ${sno} => Title: "${title}", Missing description`);
      continue;
    }

    const pdfPath = path.join(__dirname, "data3", `${sno}.pdf`);
    const coverPath = path.join(__dirname, "data3", `${sno}.2.jpg`);

    if (!fs.existsSync(pdfPath) || !fs.existsSync(coverPath)) {
      console.warn(` Missing files for SNO ${sno}`);
      continue;
    }

    try {
      const timestamp = Date.now();
      const pdfKey = `books/pdf/${timestamp}_${sno}.pdf`;
      const coverKey = `books/cover/${timestamp}_${sno}.jpg`;

      const pdfUrl = await uploadToS3(pdfPath, pdfKey);
      const coverUrl = await uploadToS3(coverPath, coverKey);

      await Book.create({
        title,
        description,
        pdfKey,
        pdfUrl,
        coverImageKey: coverKey,
        coverImageUrl: coverUrl,
        type: "free",
      });

      console.log(` Uploaded and saved book SNO ${sno}: ${title}`);
    } catch (err) {
      console.error(` Error uploading book SNO ${sno}:`, err);
    }
  }

  console.log("All uploads completed.");
  mongoose.disconnect();
};

uploadAll();