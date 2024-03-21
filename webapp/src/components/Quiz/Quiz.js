import "./Quiz.css";

import React, { useState, useRef, useEffect } from "react";
import Countdown, { zeroPad } from "react-countdown";
import Question from "./Question";
import FinalResult from "../FinalResult/FinalResult";
import CircularProgress from '@mui/material/CircularProgress';
import { ReactComponent as StopwatchIcon } from "../../assets/stopwatch-solid.svg";

const Quiz = (props) => {

  //const apiEndpoint = "http://20.117.173.161:8000"
  const apiEndpoint = "http://localhost:8000"

  var [questions, setQuestions] = useState([])

  var [error, setError] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizData, setQuizData] = useState({});

  const [haveQuestions, setHaveQuestions] = useState(false)

  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [btnDisabled, setBtnDisabled] = useState(false);

  const [timer, setTimer] = useState(Date.now() + props.timerValue * 1000);
  const [timerIndex, setTimerIndex] = useState(0);

  const countdownTimer = useRef();

  useEffect(() => {
    ; (async () => {
      try {

        setQuestions(await getQuestions())
        setHaveQuestions(true)
      } catch (error) {
        setError(error.message) // Set error state if fetch fails
      }
    })()
  }, [])


  const getQuestions = async (numQuestions) => {
    if (!numQuestions) {
      numQuestions = 10
    }
    const response = await fetch(apiEndpoint + `/questions?size=${numQuestions}`)
    if (!response.ok) { // Throw error if response is not successful
      throw new Error("Failed to fetch questions")
    }
    const data = await response.json()
    console.log(data)
    data.forEach(question => {
      question.answers = shuffle(question.answers)
    })

    return data
  }


  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

        // And swap it with the current element.
        ;[array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex]
        ]
    }
    return array
  }


  // This function is used to render the countdown timer
  const renderer = ({ minutes, seconds }) => {
    return (
      <span>
        {zeroPad(minutes)}:{zeroPad(seconds)}
      </span>
    );
  };

  const setData = (selectedAnswerId, correctIAnswerId) => {
    setQuizData({
      selectedId: selectedAnswerId,
      correctId: correctIAnswerId,
    });
  };

  //This function is used to handle the selection of an answer
  const selectAnswerHandler = (selectedAnswerId) => {

    // Set the selected state to the selected answer
    setData(selectedAnswerId, questions[currentQuestionIndex].correctAnswerId);

    // If the button is disabled, ignore the click
    if (btnDisabled) {
      return;
    }

    // Check if the selected answer is correct
    const isCorrect = questions[currentQuestionIndex].correctAnswerId === selectedAnswerId;

    // If the selected answer is correct, increment the score
    if (isCorrect) {
      setScore(score + 1);
    }

    // Disable the button
    setBtnDisabled(true);

    // Move to the next question or finish the quiz
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        setIsFinished(true);
      }

      // Reset state for the next question
      setQuizData({});
      setBtnDisabled(false);
      setTimer(Date.now() + props.timerValue * 1000);
      setTimerIndex((prevTimerIndex) => prevTimerIndex + 1);
    }, 2000);

    // Pause the timer
    pauseTimer();
  };

  const tryAgainHandler = () => {
    setCurrentQuestionIndex(0);
    setQuizData({});
    setIsFinished(false);
    setScore(0);
    setBtnDisabled(false);
    setTimer(Date.now() + props.timerValue * 1000);
    setTimerIndex((prevState) => { return prevState + 1; });
  };

  const countdownCompleteHandler = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevState) => {
        return prevState + 1;
      });

      setTimer(Date.now() + props.timerValue * 1000);
      setTimerIndex((prevState) => {
        return prevState + 1;
      });
    } else {
      setIsFinished(true);
    }
  };

  const pauseTimer = () => countdownTimer.current.pause();

  return (
    <React.Fragment>
      {!isFinished && (
        <p className="quiz-timer">
          <StopwatchIcon />
          <Countdown
            date={timer}
            key={timerIndex}
            renderer={renderer}
            onComplete={countdownCompleteHandler}
            ref={countdownTimer}
          />
        </p>
      )}

      { !haveQuestions && <CircularProgress />}


      { haveQuestions && isFinished && 
      <FinalResult result={score} quizLength={questions.length} onTryAgain={tryAgainHandler} />}
      
      { haveQuestions && !isFinished && 
      <Question
          quiz={questions[currentQuestionIndex]}
          activeQuizIndex={currentQuestionIndex + 1}
          quizLength={questions.length}
          selected={quizData}
          btnDisabled={btnDisabled}
          onSelectAnswer={selectAnswerHandler}
        />
      }
    </React.Fragment>
  );
};

export default Quiz;
