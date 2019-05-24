import React from 'react';
import {Row, Col, Container, FormGroup} from 'reactstrap';

import Header from "./elements/Header";
import Footer from "./elements/Footer";
import Input from "../core/Input";
import Button from "../core/Button";
import ResearchImage from "../../assets/images/showcase/research.png";
import CountrySelector from '../core/CountrySelector';
import connect from '../../connectors/ProfileConnector';
import {isBusinessEmail} from '../utils/search';
import FieldError from '../core/FieldError';

class ResearchPaper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first_name: '',
            last_name: '',
            company: '',
            country: '',
            email: '',
            phone_number: '',
            paper: 'scaling_your_team_with_remote_developers',
            error: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.Profile && nextProps.Profile.isSaved.visitors) {
            const downloadLink = nextProps.Profile.isSaved.visitors.download_url;

            if (!window.open(downloadLink)) {
                window.location.href = downloadLink;
            }
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const {first_name, last_name, email, phone_number, country, company, paper} = this.state;
        if (isBusinessEmail(email)) {
            this.props.ProfileActions.createVisitor({
                first_name,
                last_name,
                email,
                phone_number,
                country,
                company,
                paper,
            });
        } else {
            this.setState({error: true});
        }
    };

    onChangeField(key, e) {
        let newState = {};
        if (key === 'country') {
            newState[key] = e;
        } else {
            newState[key] = e.target.value;
        }
        this.setState(newState);
    }

    render() {
        let title = `From startup to scaleup: How to use remote workers for scaling your software development team `;
        const {first_name, last_name, company, email, country, phone_number} = this.state;
        return (
            <div className="white-paper">
                <Header title={title} description={null} showCTA={false} className="txt-center"/>
                <Container className="paper-container">
                    <Row>
                        <Col sm={7} className="spacing">
                            <p>Nowadays, scaling your business almost always requires using IT. Without software
                                development no growth. Which explains why there is such a big shortage: 83% of companies
                                have trouble finding tech talent. So what to do?</p>
                            <p>Tech companies increasingly choose to mobilize remote workers and work with distributed
                                teams. In this research report, we explore what are the best ways for startups and
                                scaleups to deal with the shortage of tech talent:</p>
                            <ul>
                                <li>What does it take to grow from startup to scaleup?</li>
                                <li>How to grow your software team?</li>
                                <li>How to use outsourcing to stay flexible?</li>
                                <li>Why is remote work becoming so popular?</li>
                                <li>How to organize software projects with distributed teams?</li>
                            </ul>
                        </Col>
                        <Col sm={1}/>
                        <Col sm={4} className="spacing">
                            <p>Please fill in this form to download the research report</p>
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
                                <Button className="btn-block" type="submit"
                                        disabled={this.props.Profile.isSaving.visitors}>Download</Button>
                            </form>
                            <p className="subscribe">
                                By submitting this form, you agree that we may contact you by mail,
                                phone or otherwise with information related to this report and the relevant
                                Tunga services. If you already have an account at Tunga, you can control the
                                messages you receive from us in your settings. If you are a guest visitor,
                                you can unsubscribe from Tunga marketing messages any time by clicking the
                                unsubscribe button in the e-mail or by sending us an e-mail to <a
                                href="mailto:hello@tunga.io">hello@tunga.io</a>
                                &nbsp;with the word “Unsubscribe” in the subject. To learn more, please visit Tunga’s
                                privacy policy page.
                            </p>
                        </Col>
                    </Row>
                    <Row className="preview-image">
                        <Col sm={7}>
                            <img src={ResearchImage} className="img-fluid"/>
                        </Col>
                    </Row>
                </Container>
                <Footer/>
            </div>
        );
    }
}

export default connect(ResearchPaper);
