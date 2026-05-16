export interface QuizOption {
    id: string;
  text: string;

}
export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizResponse {
  quizId: string;
  title: string;
  questions: QuizQuestion[];
}