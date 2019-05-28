import React from 'react';
import { Row, Col, Container, FormGroup } from 'reactstrap';

import Header from "./elements/Header";
import Footer from "./elements/Footer";
import Input from "../core/Input";
import Button from "../core/Button";
import PreviewImage from "../../assets/images/showcase/preview.png";
import CountrySelector from '../core/CountrySelector';
import connect from '../../connectors/ProfileConnector';
import { isBusinessEmail } from '../utils/search';
import  FieldError from '../core/FieldError';

class WhitePaper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first_name: '',
            last_name: '',
            company: '',
            country: '',
            email: '',
            paper: 'best_african_countries_for_outsourcing',
            phone_number: '',
            error: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.Profile && nextProps.Profile.isSaved.visitors) {
            const downloadLink = nextProps.Profile.isSaved.visitors.download_url;

            if(!window.open(downloadLink)) {
                window.location.href = downloadLink;
            }
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { first_name, last_name, email, phone_number, country, company } = this.state;
        if (isBusinessEmail(email)) {
            this.props.ProfileActions.createVisitor({
                first_name,
                last_name,
                email,
                phone_number,
                country,
                company
            });
        } else {
            this.setState({ error: true })
        }
    };

    onChangeField(key, e) {
        let newState = {};
        if (key === 'country') {
            newState[key] = e;
        } else if (key === "email") {
            console.log(e)
            this.setState({ error: false });
            newState[key] = e.target.value;
        } 
        else {
            newState[key] = e.target.value;
        }
        this.setState(newState);
    }

    render() {
        let title = "Whitepaper: Best African countries for sourcing software developers in 2019";
        const { first_name, last_name, company, email, country, phone_number } = this.state;
        return (
            <div className="white-paper">
                <Header title={title} description={null} showCTA={false} className="txt-center" />
                <Container className="paper-container">
                    <Row>
                        <Col sm={7} className="spacing">
                            <p>The African continent is emerging as a region for sourcing software developers that
                                still has a lot of untapped potential. Tech giants like Google and Microsoft are investing
                                significantly to get African tech talent into their ecosystems. It's getting increasingly difficult to hire good
                                software developers, so the African talent pool could turn out to be an interesting opportunity.</p>
                            <p>But where to start? Download our whitepaper and get the hard numbers on sourcing software programmers from Africa:</p>
                            <ul>
                                <li>Which African countries have the largest software developers pool?</li>
                                <li>Where are the developers most proficient in English?</li>
                                <li>What is the salary level and how does it differ between countries?</li>
                                <li>Which countries have the most potential moving forward in terms of business and innovation climate?</li>
                                <li>What software languages and frameworks are most popular in which African country?</li>
                            </ul>
                        </Col>
                        <Col sm={1}/>
                        <Col sm={4} className="spacing">
                            <p>Please fill in this form to download the Whitepaper</p>
                            <form onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <Input placeholder="First name"
                                        required
                                        value={first_name}
                                        onChange={this.onChangeField.bind(this, 'first_name')}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Input placeholder="Last name"
                                        required
                                        value={last_name}
                                        onChange={this.onChangeField.bind(this, 'last_name')}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Input placeholder="Company/Organization"
                                        required
                                        value={company}
                                        onChange={this.onChangeField.bind(this, 'company')}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    {this.state.error && <FieldError message="Please fill in valid business email"/>}
                                    <Input placeholder="Business email"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={this.onChangeField.bind(this, 'email')}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Input placeholder="Phone number"
                                        required
                                        value={phone_number}
                                        onChange={this.onChangeField.bind(this, 'phone_number')}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <CountrySelector value={country}
                                        onChange={this.onChangeField.bind(this, 'country')}
                                        required/>
                                </FormGroup>
                                <Button className="btn-block" type="submit" disabled={this.props.Profile.isSaving.visitors}>Download</Button>
                            </form>
                            <p className="subscribe">
                                By submitting this form, you agree that we may contact you by mail,
                                phone or otherwise with information related to this report and the relevant
                                Tunga services. If you already have an account at Tunga, you can control the
                                messages you receive from us in your settings. If you are a guest visitor,
                                you can unsubscribe from Tunga marketing messages any time by clicking the
                                unsubscribe button in the e-mail or by sending us an e-mail to <a href="mailto:hello@tunga.io">hello@tunga.io</a>
                                &nbsp;with the word “Unsubscribe” in the subject. To learn more, please visit Tunga’s
                                privacy policy page.
                            </p>
                        </Col>
                    </Row>
                    <Row className="preview-image">
                        <Col sm={7}>
                            <img src={PreviewImage} className="img-fluid" />
                        </Col>
                    </Row>
                </Container>
                <Footer/>
            </div>
        );
    }
}

export default connect(WhitePaper);
