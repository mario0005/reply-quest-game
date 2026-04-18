export type Question =
  | {
      id: string;
      type: "multiple_choice";
      prompt: string;
      options: string[];
      correctIndex: number;
      points: number;
    }
  | {
      id: string;
      type: "true_false";
      prompt: string;
      correct: boolean;
      points: number;
    }
  | {
      id: string;
      type: "text";
      prompt: string;
      acceptedAnswers: string[]; // lowercased
      points: number;
    };

export const mockQuestions: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    prompt: "Which board game uses hotels and houses on a grid of properties?",
    options: ["Catan", "Monopoly", "Risk", "Carcassonne"],
    correctIndex: 1,
    points: 10,
  },
  {
    id: "q2",
    type: "true_false",
    prompt: "Chess is played on an 8×8 board.",
    correct: true,
    points: 5,
  },
  {
    id: "q3",
    type: "text",
    prompt: "Name the small cube you roll to get a random number from 1 to 6.",
    acceptedAnswers: ["dice", "die", "a die", "a dice"],
    points: 10,
  },
  {
    id: "q4",
    type: "multiple_choice",
    prompt: "In Scrabble, how many tiles does each player hold on their rack?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2,
    points: 10,
  },
  {
    id: "q5",
    type: "true_false",
    prompt: "The game of Go originated in ancient China.",
    correct: true,
    points: 5,
  },
];
