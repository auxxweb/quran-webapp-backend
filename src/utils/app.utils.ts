import Bundle from '../models/bundle';
import Question from '../models/question'

export const createQuestionId = async () => {
  const questionCount = await Question.countDocuments()
  const paddedCount = String(questionCount + 1).padStart(4, '0') // Pads the number to 4 digits
  return `QS${paddedCount}`
}
export const createBundleId = async () => {
  const questionCount = await Bundle.countDocuments()
  const paddedCount = String(questionCount + 1).padStart(4, '0') // Pads the number to 4 digits
  return `QB${paddedCount}`
}
