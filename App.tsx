
import React, { useState } from 'react';
import { AppState, Problem, Feedback } from './types';
import { generateProblem, checkAnswer, generateVisualAid } from './services/geminiService';
import BalanceScale from './components/BalanceScale';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.HOME);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');

  const startNewProblem = async (level: string = 'easy') => {
    setIsLoading(true);
    setDifficulty(level);
    try {
      const prob = await generateProblem(level);
      setCurrentProblem(prob);
      setUserAnswer('');
      setFeedback(null);
      setVisualUrl(null);
      setState(AppState.SOLVING);
    } catch (error) {
      console.error("Failed to fetch problem", error);
      alert("문제를 가져오는 데 실패했어요. 다시 시도해볼까요?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem || !userAnswer) return;
    setIsLoading(true);
    try {
      const fb = await checkAnswer(currentProblem, userAnswer);
      setFeedback(fb);
      const imgUrl = await generateVisualAid(fb.visualPrompt);
      setVisualUrl(imgUrl);
      setState(AppState.FEEDBACK);
    } catch (error) {
      console.error("Feedback error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHome = () => (
    <div className="max-w-3xl mx-auto mt-12 text-center p-10 bg-white rounded-[2rem] shadow-2xl border-t-8 border-indigo-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <i className="fas fa-calculator text-9xl"></i>
      </div>
      
      <div className="mb-10 relative z-10">
        <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
          <i className="fas fa-user-tie text-5xl text-indigo-600"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">젬쌤의 일차방정식 교실</h1>
        <p className="text-gray-500 mt-4 text-xl font-medium">
          "수학은 원리를 알면 정말 재미있단다!<br/>나랑 같이 하나씩 풀어보지 않을래?"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {[
          { id: 'easy', label: '🌱 새싹 등급', sub: '기본 이항 연습', color: 'green', icon: 'seedling' },
          { id: 'medium', label: '🌳 나무 등급', sub: '괄호와 복합식', color: 'blue', icon: 'tree' },
          { id: 'hard', label: '🏔️ 산 등급', sub: '분수와 소수 정복', color: 'purple', icon: 'mountain' }
        ].map((level) => (
          <button 
            key={level.id}
            onClick={() => startNewProblem(level.id)}
            className={`p-8 bg-${level.color}-50 hover:bg-${level.color}-100 border-2 border-${level.color}-200 rounded-3xl transition-all transform hover:-translate-y-1 hover:shadow-lg group text-left`}
          >
            <i className={`fas fa-${level.icon} text-${level.color}-400 mb-4 text-2xl group-hover:scale-125 transition-transform`}></i>
            <div className={`text-xl font-bold text-${level.color}-700 mb-1`}>{level.label}</div>
            <p className={`text-sm text-${level.color}-600/80`}>{level.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSolving = () => (
    <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-[2rem] shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setState(AppState.HOME)} className="text-gray-400 hover:text-gray-600 font-bold flex items-center gap-2 transition-colors">
          <i className="fas fa-chevron-left"></i> 교무실로
        </button>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          수업 진행 중
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-3xl text-center mb-8 shadow-lg shadow-indigo-100">
        <h2 className="text-indigo-200 text-xs font-bold mb-4 uppercase tracking-[0.2em]">칠판에 적힌 문제</h2>
        <div className="text-5xl font-black text-white tracking-widest drop-shadow-md">
          {currentProblem?.equation}
        </div>
      </div>

      <div className="mb-10">
        <BalanceScale 
          left={currentProblem?.equation.split('=')[0].trim() || ''} 
          right={currentProblem?.equation.split('=')[1].trim() || ''} 
        />
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
        <label className="block text-gray-600 font-bold mb-3 ml-1 text-sm">연습장에 정답을 적어봐!</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl italic">x =</span>
            <input 
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="?"
              className="w-full text-2xl pl-12 pr-4 py-4 border-2 border-white rounded-xl focus:border-indigo-400 outline-none transition-all shadow-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isLoading || !userAnswer}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-10 py-4 rounded-xl font-black transition-all shadow-md active:scale-95"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : '제출하기'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="max-w-3xl mx-auto mt-8 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-10 rounded-[2.5rem] shadow-2xl ${feedback?.isCorrect ? 'bg-white border-t-[12px] border-green-500' : 'bg-white border-t-[12px] border-orange-400'}`}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-24 h-24 flex-shrink-0 relative">
             <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${feedback?.isCorrect ? 'bg-green-400' : 'bg-orange-400'}`}></div>
             <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Teacher" alt="Teacher Avatar" className="w-full h-full object-cover rounded-full bg-indigo-50 border-4 border-white shadow-lg relative z-10" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 ${feedback?.isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {feedback?.isCorrect ? 'Excellent!' : 'Keep Going!'}
            </div>
            <h3 className={`text-3xl font-black mb-4 ${feedback?.isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
              {feedback?.isCorrect ? '완벽해! 정말 잘했어!' : '아쉽지만 거의 다 왔어!'}
            </h3>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
               <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap italic">
                 "{feedback?.message}"
               </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {visualUrl && (
            <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 group">
              <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500"><i className="fas fa-magic mr-1 text-indigo-400"></i> 선생님의 그림 설명</span>
                <i className="fas fa-search-plus text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
              <img src={visualUrl} alt="Visual Aid" className="w-full aspect-square object-cover" />
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="bg-indigo-50/50 p-6 rounded-3xl border-2 border-dashed border-indigo-200">
              <h4 className="font-black text-indigo-900 mb-4 flex items-center text-lg">
                <i className="fas fa-list-ol mr-3 text-indigo-500"></i> 올바른 풀이 단계
              </h4>
              <ul className="space-y-3">
                {currentProblem?.steps.map((step, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-indigo-800 font-medium bg-white/60 p-3 rounded-xl border border-indigo-100/50">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">{idx + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200 shadow-sm">
              <h4 className="font-bold text-yellow-800 mb-2 flex items-center">
                <i className="fas fa-lightbulb text-yellow-500 mr-2"></i> 오늘의 수학 한 마디
              </h4>
              <p className="text-sm text-yellow-900/80 leading-snug font-medium">"{feedback?.conceptTip}"</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => startNewProblem(difficulty)}
            className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3"
          >
            <i className="fas fa-redo-alt"></i> 다음 문제 도전!
          </button>
          <button 
            onClick={() => setState(AppState.HOME)}
            className="sm:w-1/3 py-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xl rounded-2xl transition-all flex items-center justify-center gap-3"
          >
            <i className="fas fa-home"></i> 처음으로
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-20 px-4">
      <header className="max-w-5xl mx-auto flex items-center justify-between py-8 border-b border-gray-100 mb-8">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setState(AppState.HOME)}>
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">x</div>
          <div>
            <span className="block text-2xl font-black text-gray-900 leading-none">방정식 튜터</span>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Smart Math Teacher</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm font-bold text-gray-400">
            <span className="hover:text-indigo-500 cursor-pointer transition-colors">학습 가이드</span>
            <span className="hover:text-indigo-500 cursor-pointer transition-colors">나의 통계</span>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-gray-700">
              <i className="fas fa-user-graduate text-indigo-400"></i> 열공 학생님
            </div>
        </div>
      </header>

      <main>
        {state === AppState.HOME && renderHome()}
        {state === AppState.SOLVING && renderSolving()}
        {state === AppState.FEEDBACK && renderFeedback()}
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-indigo-900/10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center border border-indigo-50 animate-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="w-20 h-20 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600">x</div>
            </div>
            <p className="mt-8 font-black text-gray-800 text-xl">젬쌤이 칠판을 정리하고 있어요...</p>
            <p className="mt-2 text-gray-400 text-sm font-medium">잠시만 기다려주세요!</p>
          </div>
        </div>
      )}

      <footer className="max-w-4xl mx-auto mt-24 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-gray-400 text-xs gap-4">
        <p>© 2024 젬쌤의 수학 교실. 인공지능이 제공하는 맞춤형 수학 교육 서비스입니다.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-indigo-500 transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">이용약관</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
