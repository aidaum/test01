
import { GoogleGenAI, Type } from "@google/genai";
import { Problem, Feedback } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProblem = async (difficulty: string): Promise<Problem> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `중학교 1학년 수학 교사로서 일차방정식 문제를 하나 출제해주세요. 
    난이도는 '${difficulty}'입니다. 
    - easy: x + a = b 형태
    - medium: ax + b = cx + d 또는 괄호가 있는 형태
    - hard: 분수나 소수가 포함된 복잡한 형태
    정답은 가급적 정수가 나오도록 설계해주세요.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          equation: { type: Type.STRING, description: "예: 2x + 5 = 11" },
          steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "풀이 과정의 각 단계" },
          finalAnswer: { type: Type.NUMBER },
          difficulty: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "이 문제에서 배워야 할 핵심 포인트" }
        },
        required: ["id", "equation", "steps", "finalAnswer", "difficulty", "explanation"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const checkAnswer = async (problem: Problem, userAnswer: string): Promise<Feedback> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `[상황] 중학교 1학년 수학 시간입니다.
    문제: ${problem.equation}
    정확한 풀이 과정: ${problem.steps.join(' -> ')}
    정답: ${problem.finalAnswer}
    학생이 입력한 답: ${userAnswer}

    수학 선생님의 입장에서 다음을 포함하여 응답해주세요:
    1. 정답 여부
    2. 피드백 메시지: 학생의 답을 분석하여 틀렸다면 어느 부분(이항 시 부호 실수, 사칙연산 실수 등)에서 막혔을지 따뜻하게 짚어주세요. 맞았다면 칭찬해주세요.
    3. visualPrompt: 이 문제의 개념(이항, 양변에 같은 수 더하기/나누기 등)을 시각적으로 설명하기 위한 이미지 생성 프롬프트(영문). 양팔 저울이나 사과 박스, 수직선 등을 활용한 교육용 일러스트 묘사.
    4. conceptTip: 꼭 기억해야 할 수학적 원리 한 문장.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          message: { type: Type.STRING },
          visualPrompt: { type: Type.STRING },
          conceptTip: { type: Type.STRING }
        },
        required: ["isCorrect", "message", "visualPrompt", "conceptTip"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Educational 2D vector illustration for a math classroom. Theme: ${prompt}. Clean, bright, simple, pastel colors, white background. Professional school book style.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return '';
};
