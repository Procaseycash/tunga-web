import React from 'react';
import {Link} from 'react-router-dom';
import {Row, Col} from 'reactstrap';
import Slider from 'react-slick';

import Header from "./elements/Header";
import ContactUs from "./elements/ContactUs";
import Footer from "./elements/Footer";
import Title from "./elements/Title";
import Press from "./elements/Press";
import Partners from "./elements/Partners";
import Button from "../core/Button";
import Icon from "../core/Icon";
import JSXify from "../core/JSXify";

import {proxySafeUrl} from "../utils/proxy";
import {openCalendlyWidget} from "../utils/calendly";
import {TESTIMONIALS} from "../utils/testimonials";

const SLIDER_SETTINGS = {
    dots: true,
    arrows: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    centerMode: true,
    centerPadding: 0,
    responsive: [
        {
            breakpoint: 481,
            settings: {slidesToShow: 1 /*, centerMode: true*/},
        },
        {
            breakpoint: 769,
            settings: {slidesToShow: 2 /*, centerMode: true*/},
        },
        {
            breakpoint: 1025,
            settings: {
                slidesToShow: 3,
                centerMode: true,
                centerPadding: 0,
            },
        },
    ],
};

const HOME_DEFAULTS = {
    welcome_header: "Unleashing Africa's Tech Talent",
    welcome_sub_header: "Small and large businesses from all over the world use Tunga for hiring African software engineers to address their most pressing software development needs.",
    welcome_cta: 'Schedule a call',
    pitch_header: "Our unusual approach to software development",
    pitch_body: (
        <div>
            <p>
                Software projects often go wrong because of
                people misunderstanding each other. Tunga
                was founded by people from the hospitality
                sector to solve this problem with a simple
                idea: apply our human-centered mindset to
                the software development process and its
                actors.
            </p>

            <p>
                We work with a community of highly talented
                youths from several African countries, who
                are committed to go the extra mile for you.
                Why? Because we not only pay a lot of
                attention to our managers and developers
                growing a customer-focused attitude, we also
                do our utmost to address their needs by
                creating interesting and worthwhile work
                opportunities for them.
            </p>

            <p>
                Do you support our mission to create
                opportunities for African youths? Become a{' '}
                <Link to="/friends-of-tunga">
                    'Friend of Tunga'!
                </Link>{' '}
                For each client you refer to us we donate a
                sum to WeAreBits, a network of African
                schools that focus on giving quality and
                free IT-education to youths from less
                privileged backgrounds.
            </p>

            <Button onClick={() => {openCalendlyWidget()}} size="lg">
                Find out what we can do for you
            </Button>

            <Link
                className="btn btn-primary btn-lg d-block d-sm-none"
                to="/friends">
                Become a friend of Tunga
            </Link>
        </div>
    ),
};

export default class Home extends React.Component {

    componentDidMount() {
        const {showCall} = this.props;
        if(showCall) {
            openCalendlyWidget();
        }
    }

    componentDidUpdate(prevProps, prevState, snapShot) {
        if(this.props.showCall && !prevProps.showCall) {
            openCalendlyWidget();
        }
    }

    render() {
        const {skill_page, isLoading} = this.props;
        const getSafeValue = (key) => {
            return isLoading?'...':(skill_page && skill_page[key] || HOME_DEFAULTS[key] || null);
        };

        let title = getSafeValue('welcome_header'),
            description = (
                <JSXify>
                    {getSafeValue('welcome_sub_header')}
                </JSXify>
            ),
            ctaText = getSafeValue('welcome_cta'),
            pitchImage = getSafeValue('pitch_image');

        return (
            <div className={`landing-page ${skill_page?'skill-page':''}`}>
                <Header className={`height-${skill_page?'80':'100'}`} title={title} description={description} ctaText={ctaText} ctaSize={'xxl'}>
                    {isLoading || skill_page?null:(
                        <section id="services">
                            <div className="service">
                                <div className="wrapper">
                                    <div className="headline">
                                        Effortless software projects
                                    </div>
                                    <div>
                                        Need an app or website? We can build software for
                                        you on-demand and turn-key.
                                        <Link
                                            to={proxySafeUrl('/effortless-software-projects')}>
                                            find out more
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="service">
                                <div className="wrapper">
                                    <div className="headline">Dedicated developers</div>
                                    <div>
                                        Use Tunga to quickly mobilize developers. Parttime
                                        or fulltime. Individuals or entire teams.
                                        <Link
                                            to={proxySafeUrl('/dedicated-developers')}>
                                            find out more
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="service">
                                <div className="wrapper">
                                    <div className="headline">Recruitment services</div>
                                    <div>
                                        Tap into our network of top African software
                                        programmers to reinforce your own tech team.
                                        <Link
                                            to={proxySafeUrl('/it-recruitment')}>
                                            find out more
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </Header>

                <section id="unique-approach" className="clearfix">
                    <Row>
                        <Col lg={8}>
                            <div className="approach-body">
                                <Title>
                                    {getSafeValue('pitch_header')}
                                </Title>

                                <div>
                                    {getSafeValue('pitch_body')}
                                </div>
                            </div>
                        </Col>
                        <Col className="side-pic" style={pitchImage?{backgroundImage: `url(${pitchImage})`}:{}}/>
                    </Row>
                </section>

                {isLoading || skill_page?null:(
                    <React.Fragment>
                        <section id="development-style">
                            <div>
                                <Title>
                                    Software development Tunga-style
                                </Title>

                                <div className="development-style-pitch">
                                    We have built a large pool of top African
                                    tech talent that can be deployed flexibly
                                    and rapidly to help you meet your specific
                                    software development needs.
                                </div>

                                <div className="development-style-cases">
                                    <div className="case">
                                        <Icon name="file-search" className="icon"/>

                                        <p>
                                            <div className="title">
                                                Result-oriented
                                            </div>
                                            We pay a lot of attention to scoping
                                            your project and working out the
                                            technical details. Then we go all
                                            the way to deliver them.
                                        </p>
                                    </div>
                                    <div className="case">
                                        <Icon name="team" className="icon"/>

                                        <p>
                                            <div className="title">
                                                Quality assured
                                            </div>
                                            We have developed a unique, highly
                                            professional and effective way of
                                            working that enables clients and
                                            developers from any part of the
                                            world to collaborate efficiently.
                                        </p>
                                    </div>
                                    <div className="case">
                                        <Icon name="money-loop" className="icon"/>
                                        <p>
                                            <div className="title">
                                                Affordable
                                            </div>
                                            Our developers are for hire at a
                                            flat rate. We
                                            calculate projects transparently and
                                            stick with that. No excuses, no
                                            discussions, no additional costs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="meet-developers">
                            <div>
                                <Link to="/quality" className="headline">
                                    Meet our thriving community of developers
                                </Link>
                                <p>
                                    Find out how we select our developers and meet some
                                    of our talented experts.
                                </p>
                            </div>
                        </section>
                    </React.Fragment>
                )}

                <Press/>

                {isLoading || skill_page?(
                    skill_page?(
                        <React.Fragment>
                            <section id="story">
                                <div className="container">
                                    <Title>
                                        <JSXify>
                                            {skill_page.content_header}
                                        </JSXify>
                                    </Title>

                                    <div className="readable">
                                        <JSXify>
                                            {getSafeValue('content')}
                                        </JSXify>
                                    </div>

                                    {skill_page.content_image ? (
                                        <img src={skill_page.content_image} />
                                    ) : null}

                                    <div className="readable">
                                        <JSXify>
                                            {skill_page.story_body_two}
                                        </JSXify>
                                    </div>

                                    <div className="readable">
                                        <JSXify>
                                            {skill_page.story_body_three}
                                        </JSXify>
                                    </div>

                                    <div className="text-center">
                                        <Button size="lg"
                                                onClick={() => {openCalendlyWidget()}}>
                                            Schedule a call with us
                                        </Button>
                                    </div>
                                </div>
                            </section>
                            {skill_page.story_interlude_one_text?(
                                <section
                                    id="story-interlude-one"
                                    style={
                                        skill_page.story_interlude_one_image
                                            ? {
                                                backgroundImage: `url(${
                                                    skill_page.story_interlude_one_image
                                                    })`,
                                            }
                                            : {}
                                    }>
                                    <div className="container">
                                        <JSXify>
                                            {skill_page.story_interlude_one_text}
                                        </JSXify>
                                        {skill_page.story_interlude_one_cta ? (
                                            <Link to="/start" className="cta">
                                                {skill_page.story_interlude_one_cta}
                                            </Link>
                                        ) : null}
                                    </div>
                                </section>
                            ):null}
                        </React.Fragment>
                    ):null
                ):(
                    <React.Fragment>
                        <section id="case-studies">
                            <div className="container">
                                <Title>Case Studies</Title>
                                <div id="clients-testmonial-landing-page">
                                    <Slider
                                        className="testimonials-slider text-center"
                                        {...SLIDER_SETTINGS}>
                                        {TESTIMONIALS.map(testimonial => {
                                            return (
                                                <div className="testimonial-landing-page">
                                                    <div className="body">
                                                        <div>
                                                            <i className="fa fa-quote-left pull-left"/>
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html:
                                                                    testimonial.message,
                                                                }}
                                                            />
                                                            <i className="fa fa-quote-right pull-right"/>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="image"
                                                        style={{
                                                            backgroundImage: `url(${
                                                                testimonial.image
                                                                })`,
                                                        }}
                                                    />
                                                    <div className="author">
                                                        {testimonial.name}
                                                    </div>
                                                    <div className="company">
                                                        <p>
                                                            {testimonial.position}{' '}
                                                            {testimonial.company}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </Slider>
                                </div>
                            </div>
                        </section>

                        <Partners title={
                            <div className="supported-by">
                                Supported By:
                            </div>
                        }>
                        </Partners>

                        <section className="what-we-do-best">
                            <div className="container ">
                                <div>
                                    <Title>What we do best</Title>
                                    <Row>
                                        <Col md={4} className="skill">
                                            <img
                                                src={require('../../assets/images/showcase/TungaMobileSkills.png')}
                                            />
                                        </Col>
                                        <Col md={4} className="skill">
                                            <img
                                                src={require('../../assets/images/showcase/TungaWebSkills.png')}
                                            />
                                        </Col>
                                        <Col md={4} className="skill">
                                            <img
                                                src={require('../../assets/images/showcase/TungaOtherSkills.png')}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                                <div className="text-center">
                                    <Button onClick={() => {openCalendlyWidget()}} size="lg">
                                        Find out what we can do for you
                                    </Button>
                                </div>
                            </div>
                        </section>
                    </React.Fragment>
                )}

                <ContactUs/>

                <Footer/>
            </div>
        );
    }
}