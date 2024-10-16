import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import uniqid from "uniqid";
import store from "store";
import Question from "../../models/question";

export const uploadQuestionDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
      res.status(400);
      throw new Error("Please enter all the fields");
    }
    const regExp = new RegExp(`^${question}$`);

    const existQuestion = await Question.findOne({
      question: { $regex: regExp, $options: "" },
      isDeleted: false,
    });
    if (existQuestion) {
      res.status(400);
      throw new Error(`This question already exists`);
    }
    let tx_uuid = uniqid();
    store.set("uuid", { tx: tx_uuid });
    const newQuestion = await Question.create({
      ...req.body,
      questionId: tx_uuid,
    });
    if (!newQuestion) {
      res.status(400);
      throw new Error("Question upload failed");
    }

    res.status(201).json({
      success: true,
      msg: "Question details successfully uploaded",
    });
  }
);

// PATCH || update Question details

export const updateQuestionDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { questionId, question } = req.body;

    if (!questionId) {
      res.status(400);
      throw new Error("Question Id  not found");
    }
    if (question) {
      const existingQuestion = await Question.findOne({
        _id: questionId,
        isDeleted: false,
      });
      if (!existingQuestion) {
        res.status(404);
        throw new Error("Zone not found");
      }

      if (existingQuestion.question !== question) {
        const regExp = new RegExp(`^${question}$`);

        const existQuestion = await Question.findOne({
          question: { $regex: regExp, $options: "" },
          isDeleted: false,
        });

        if (existQuestion) {
          res.status(400);
          throw new Error("This Question already exists");
        }
      }
    }

    const updatedQuestion = await Question.findOneAndUpdate(
      { _id: questionId, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!updatedQuestion) {
      res.status(400);
      throw new Error("Question not updated");
    }

    res.status(200).json({
      success: true,
      msg: "Question details successfully updated",
    });
  }
);

// DELETE ||  delete question details

export const deleteQuestionDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { questionId } = req.query;

    if (!questionId) {
      res.status(400);
      throw new Error("questionId not found");
    }

    const question = await Question.findByIdAndUpdate(
      { _id: questionId },
      {
        isDeleted: true,
      },
      { new: true }
    );
    if (!question) {
      res.status(400);
      throw new Error("Deletion failed");
    }

    res.status(200).json({
      success: true,
      msg: `${question?.questionId} successfully deleted`,
    });
  }
);

// GET || get Question details
export const getQuestionDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const searchData = (req.query.search as string) || "";
    const query: any = { isDeleted: false };
    if (searchData !== "") {
      query.questionId = { $regex: new RegExp(`^${searchData}.*`, "i") };
    }

    const questions = await Question.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalDocuments = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      questions: questions || [],
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      msg: "Questions details successfully retrieved",
    });
  }
);

// GET || get question  and ids
export const getAllQuestionsNames = asyncHandler(
    async (req: Request, res: Response) => {
      const questions = await Question.find({ isDeleted: false }, { question: 1 });
  
      res.status(200).json({
        success: true,
        questions: questions || [],
        msg: "Question details successfully retrieved",
      });
    }
  );
  