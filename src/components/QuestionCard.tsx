import { Question } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProgressDots from './ProgressDots';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onSelect: (option: 'A' | 'B') => void;
}

const QuestionCard = ({ question, currentIndex, totalQuestions, onSelect }: QuestionCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <ProgressDots total={totalQuestions} current={currentIndex} />
      
      <Card className="w-full max-w-lg p-8 bg-card shadow-xl border-0">
        <p className="text-sm font-medium text-muted-foreground mb-6 text-center">
          Question {currentIndex + 1} of {totalQuestions}
        </p>
        
        <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-8">
          {question.question}
        </h2>
        
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            onClick={() => onSelect('A')}
            className="w-full py-4 px-4 text-left h-auto border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all whitespace-normal break-words min-h-[60px]"
          >
            <span className="text-sm md:text-base font-medium text-foreground leading-relaxed block w-full">
              {question.optionA.text}
            </span>
          </Button>
          
          <div className="text-center text-muted-foreground font-medium text-sm">or</div>
          
          <Button
            variant="outline"
            onClick={() => onSelect('B')}
            className="w-full py-4 px-4 text-left h-auto border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all whitespace-normal break-words min-h-[60px]"
          >
            <span className="text-sm md:text-base font-medium text-foreground leading-relaxed block w-full">
              {question.optionB.text}
            </span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuestionCard;
