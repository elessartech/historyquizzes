import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import Question from '../../../components/Question/Question';
import TestButton from '../../../components/UI/TestButton/TestButton';
import Spinner from '../../../components/UI/Spinner/Spinner';
import classes from './Creating.css'
import * as actions from '../../../store/actions/index';

class Creating extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            descr: '',
            numberOfQ: null,
            numberOfA: null,
            questions: {},
            formIsValid: true,
            testSent: false
        }
    }

    handleInputs = ({target}) => {
        this.setState({[target.name]: target.value});
    };

    handleQuestions = ({target}) => {
        // handling form filling 
        let cloneObj = Object.assign({}, this.state.questions);
        let questionNumber;
        let questionElName;

        if (target.name.includes('answer')) {
            questionNumber = target.name.replace('answerquestion', '');
            questionElName = 'answers'
        }
        else if (target.name.includes('right')) {
            questionNumber = target.name.replace('rightquestion', '');
            questionElName = 'rightAnswer'
        }
        else {
            questionNumber = target.name.replace('question', '');
            questionElName = 'question';
        }


        if ( typeof cloneObj[questionNumber] === "undefined" ) {
            cloneObj[questionNumber] = {}
        }

        if (typeof cloneObj[questionNumber][questionElName] === "undefined") {
            cloneObj[questionNumber][questionElName] = {}
        }

        questionElName === 'answers' ? cloneObj[questionNumber][questionElName][target.id] = target.value : cloneObj[questionNumber][questionElName] = target.value;

        this.setState({questions: cloneObj});
    };

    isFormValid = (obj) => {
        if (Object.keys(obj).length === Number(this.state.numberOfQ) && typeof obj !== "undefined" && Object.keys(obj).length > 0 && this.state.title.length > 0 && this.state.descr.length > 0) {
            for (let key in obj) {
                const testCell = obj[key];
                if (Object.keys(testCell).length < 3) { // 3 keys - [ question, answers, rightAnswer ]
                    return false
                }
            }
        }
        else { return false }
        return true;
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const formValidated = this.isFormValid(this.state.questions);
        if (formValidated) {
            let testToBeSent = {
                testData: this.state.questions,
                userId: this.props.userId
            }
            this.props.onTestSubmission(testToBeSent, this.props.token);
            this.setState({testSent: true}) 
        }
        else {
            this.setState({formIsValid: false});
        }
    }

    render() {
        const qValues = [5, 10, 15, 20, 25, 30]; // numbers of questions
        const numberQValues = qValues.map((el, i) => (
           <option value={el} key={i} >{el}</option>
        ));

        const aValues = [2, 3, 4, 5, 6]; // numbers of answers to the above mentioned questions
        const numberAValues = aValues.map((el, i) => (
            <option value={el} key={i} >{el}</option>
        ));

        let questions = [];
        
        for (let i = 0; i < this.state.numberOfQ; i++) {
            let id = Number(i + 1)
            questions.push(<Question handleQuestions={this.handleQuestions} id={id} key={id} numberOfA={this.state.numberOfA}/>)
        }
        const sentRedirect = this.state.testSent ? <Redirect to="/"/> : null;
        let form = (
            <form onSubmit={this.handleSubmit}>
                {sentRedirect}
                <input 
                    className={classes.TitleInput}
                    name="title"
                    placeholder="Type the title here"
                    value={this.state.title}
                    onChange={this.handleInputs}
                />
                <textarea
                    className={classes.DescrTextarea}
                    name="descr"
                    placeholder="Type the desciption here"
                    value={this.state.descr}
                    onChange={this.handleInputs}
                />
                <div className={classes.QuestionSelectDiv}>
                    <select className={classes.QuestionsSelectInput} defaultValue="Number of Questions" name='numberOfQ' onChange={this.handleInputs} >
                        <option disabled defaultValue>Number of Questions</option>
                        {numberQValues}
                    </select>
                    <select className={classes.QuestionsSelectInput} defaultValue="Number of Answers" name='numberOfA' onChange={this.handleInputs} >
                        <option disabled defaultValue>Number of Answers</option>
                        {numberAValues}
                    </select>
                </div>
                {questions}
                <TestButton>Submit</TestButton>
            </form>
        )
        if ( this.props.loading ) {
            form = <Spinner />;
        }
        return (
            <div className={classes.CreatingPageWrap}>
                <ErrorMessage hidden={this.state.formIsValid}>Please, fill all the inputs!</ErrorMessage>
                <div className={classes.CreatingForm}>
                    {form}
                </div>
            </div>
        )
    }
} 

const mapStateToProps = state => {
    return {
        loading: state.tests.loading,
        token: state.auth.token,
        userId: state.auth.userId
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onTestSubmission: (testData, token) => dispatch(actions.testCreator(testData, token))
    };
};


export default connect( mapStateToProps, mapDispatchToProps ) (Creating);