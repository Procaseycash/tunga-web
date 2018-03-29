import React from 'react';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import YouTube from 'react-youtube';
import Slider from 'react-slick';
import Reveal from 'react-reveal';

import ShowcaseContainer from '../containers/ShowcaseContainer';
import ShowCaseFooter from '../containers/ShowCaseFooter';
import ComponentWithModal from '../components/ComponentWithModal';
import MetaTags from '../components/MetaTags';
import Avatar from '../components/Avatar';

import Progress from '../components/status/Progress';

import {
  showCallWidget,
  openCalendlyWidget,
  isTungaDomain,
} from '../utils/router';
import {TESTIMONIALS} from '../constants/data';

import * as SkillPageActions from '../actions/SkillPageActions';
import {nl_to_br} from '../utils/html';

import {
  sendGAEvent,
  GA_EVENT_CATEGORIES,
  GA_EVENT_ACTIONS,
  GA_EVENT_LABELS,
} from '../utils/tracking';
import {Button, Form, FormControl, FormGroup} from "react-bootstrap";

const STEP_DETAILS = [
  {
    title: 'Tell us what you want to build.',
    icon: 'tunga-icon-how-needs',
  },
  {
    title: 'Tunga matches developers with objectively verified skills.',
    icon: 'tunga-icon-how-matches',
  },
  {
    title: 'Developers start working in your workflow or set one up for you.',
    icon: 'tunga-icon-how-workflow',
  },
  {
    title: 'Get daily feedback reports on progress & quality.',
    icon: 'tunga-icon-how-feedback',
  },
];

class HowItWorks extends React.Component {
  render() {
    return (
      <section id="how-it-works">
        <div className="container">
          <div className="step-slider two-sm four-md clearfix">
            <ul>
              {STEP_DETAILS.map((step, idx) => {
                return (
                  <li key={idx}>
                    <div
                      href="#"
                      className="slide animated fadeInRight"
                      style={{animationDelay: `${idx}s`}}>
                      <div className="icon">
                        <span className="number">
                          {idx + 1}
                        </span>
                        <i className={step.icon}/>
                      </div>
                      <span dangerouslySetInnerHTML={{__html: step.title}}/>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    );
  }
}

const NETWORK_EXPERTISE = [
  {
    content: (
      <div>
        Full stack capacity for web API development<br/>
        All popular JS frameworks<br/>
        Backend development
      </div>
    ),
    icon: 'tunga-icon-service-web',
  },
  {
    content: (
      <div>
        Excellent native app development<br/>
        Dedicated iOS and Android teams<br/>
        App maintenance and improvements
      </div>
    ),
    icon: 'tunga-icon-service-app',
  },
  {
    content: (
      <div>
        Dedicated project managers<br/>
        Daily updates from developers<br/>
        Full overview of progress
      </div>
    ),
    icon: 'tunga-icon-service-pm',
  },
  {
    content: (
      <div>
        Easily customize your workflow<br/>
        with Slack, Trello, GDrive, Github<br/>
        on Tunga
      </div>
    ),
    icon: 'tunga-icon-service-workflow',
  },
];

let overlayTimer = null;

export class LandingPage extends ComponentWithModal {
  constructor(props) {
    super(props);
    this.state = {
      player: null,
      play: false,
      step: 0,
      pageClass: '',
      showVideo: true,
      youtubeOpts: {height: '360px'},
      hasAnimatedNumbers: false,
      isSkillPage: false,
      showOverlay: false,
      closeChat: false,
    };
  }

  componentDidMount() {
    if (showCallWidget(this.props.routes)) {
      openCalendlyWidget();
    }

    let skill = this.getDLPTag();
    if (skill) {
      const {SkillPageActions} = this.props;
      this.setState({isSkillPage: true});
      SkillPageActions.retrieveSkillPage(skill);
    }

    let lp = this;

    function displayOverlay() {
      if (window.tungaCanOpenOverlay) {
        lp.setState({showOverlay: true});
      }
    }

    function resetTimer() {
      if (overlayTimer) {
        clearTimeout(overlayTimer);
      }
      if (window.tungaCanOpenOverlay) {
        overlayTimer = setTimeout(displayOverlay, __PRODUCTION__ ? 45000 : 6000);
      }
    }

    window.tungaCanOpenOverlay = true;
    resetTimer();

    // Reset timer when any activity happens
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onscroll = resetTimer;

    let updateBg = function () {
      let menuItemToggled = false;
      let windowWidth = $(window).innerWidth();
      let width = windowWidth / 2;
      let height = 60;
      let roundTungaLogoTop = $('.tunga-logo-top');

      if (windowWidth <= 360) {
        height = 30;
        lp.setState({youtubeOpts: {width: `${windowWidth}px`}});
      } else {
        lp.setState({youtubeOpts: {width: '800', height: '450'}});
      }
      $('.ribbon').css('borderWidth', `${height}px ${width}px 0`);

      $(this).scroll(function () {
        var currentPos = $(this).scrollTop();
        var cta = $('header .btn-callout.btn-main-cta');
        if (!cta.size()) {
          cta = $('.lander .task-wizard .btn.cta-action');
        }

        if (cta.size()) {
          var ctaPos = cta.offset().top;
          var navActions = $('.nav.nav-actions');

          if (currentPos >= ctaPos + 50) {
            navActions.addClass('show-launch');
          } else {
            navActions.removeClass('show-launch');
          }
        }

        var stats = $('#platform-stats');
        if (stats.size()) {
          var statsPos = $('footer').offset().top;
          if (currentPos >= statsPos - 800) {
            stats.find('.stat').each(function (idx, elem) {
              if (!lp.state.hasAnimatedNumbers) {
                var numAnim = new CountUp(
                  $(elem).attr('id'),
                  0,
                  parseInt($(elem).attr('data-number')),
                );
                numAnim.start();
              }
            });
            lp.setState({hasAnimatedNumbers: true});
          } else if (currentPos <= statsPos - 1300) {
            lp.setState({hasAnimatedNumbers: false});
          }
        }

        /*var outsourceWidget = $('.outsource-widget');
        if (outsourceWidget.size()) {
          var outWidgetPos = $('footer').offset().top;
          if (currentPos >= outWidgetPos - 500) {
            if (outsourceWidget.hasClass('slideOutRight')) {
              outsourceWidget.removeClass('open animated slideOutRight');
            }
            outsourceWidget.addClass('open animated slideInRight');
          } else if (currentPos <= outWidgetPos - 1000) {
            if (outsourceWidget.hasClass('slideInRight')) {
              outsourceWidget.removeClass('slideInRight');
              outsourceWidget.addClass('animated slideOutRight');
            }
          }
        }*/

        if (roundTungaLogoTop.size()) {
          var logoPos = roundTungaLogoTop.offset().top;
          var currentLogoPos = logoPos - $(this).scrollTop();

          if (menuItemToggled === true) {
            if (currentPos >= 0) {
              $('.navbar').addClass('navbarbgOnScroll');
              $('.navbar').removeClass('navbar-brand');
              $('.navbar-brand').addClass('medium-showcase');
              $('.navbar-brand').addClass('navbar-scrolled-top');
            }
          } else {
            if (currentPos >= logoPos + 50) {
              $('.navbar').addClass('navbarbgOnScroll');
              $('.navbar').removeClass('navbar-brand');
              $('.navbar-brand').addClass('medium-showcase');
              $('.navbar-brand').addClass('navbar-scrolled-top');
            } else {
              $('.navbar').removeClass('navbarbgOnScroll');
              $('.navbar-brand').removeClass('medium-showcase');
              $('.navbar-brand').removeClass('navbar-scrolled-top');
            }
          }
        }
      });

      $('.navbar-toggle').click(function () {
        if (windowWidth < 768) {
          var $navbar = $('.navbar-collapse');
          var _opened = $navbar.hasClass('in');

          if (_opened === true) {
            var logoPos = roundTungaLogoTop.offset().top;
            var currentLogoPos = logoPos - $(document).scrollTop();
            // console.log('position 2 is '+ currentLogoPos);
            menuItemToggled = false;
            if (currentLogoPos >= 50) {
              $('.navbar').removeClass('navbarbg');
              $('.navbar-brand').removeClass('medium-showcase');
            } else {
              $('.navbar-brand').addClass('medium-showcase');
            }
            // console.log('closed');
          } else {
            $('.navbar').addClass('navbarbg');
            $('.navbar').removeClass('navbar-brand');
            $('.navbar-brand').addClass('medium-showcase');
            menuItemToggled = true;
            // console.log('open');
          }
        }
      });
    };

    $(document).ready(updateBg);
    $(window).resize(updateBg);
  }

  componentWillUnmount() {
    window.tungaCanOpenOverlay = false;
  }

  onScheduleCall() {
    openCalendlyWidget();
  }

  onVideoReady(e) {
    var player = e.target;
    if (player) {
      this.setState({player: e.target});
    }
  }

  onPlayVideo() {
    this.setState({play: true});
    if (this.state.player) {
      this.state.player.playVideo();
      sendGAEvent(
        GA_EVENT_CATEGORIES.VIDEO,
        GA_EVENT_ACTIONS.PLAY,
        GA_EVENT_LABELS.INTRO_VIDEO,
      );
    }
  }

  onPauseVideo() {
    sendGAEvent(
      GA_EVENT_CATEGORIES.VIDEO,
      GA_EVENT_ACTIONS.PAUSE,
      GA_EVENT_LABELS.INTRO_VIDEO,
    );
  }

  onCloseVideo() {
    this.setState({play: false});
    if (this.state.player) {
      this.state.player.stopVideo();
    }
  }

  onChangeSliderStep(step) {
    this.setState({step});
  }

  onCloseOverlay() {
    window.tungaCanOpenOverlay = false;
    this.setState({showOverlay: false});
  }

  getDLPTag() {
    const {location, params} = this.props;
    if (params && params.skill) {
      return params.skill;
    }
    if (location.query && location.query.dlp_tag) {
      return location.query.dlp_tag;
    }
    return null;
  }

  getDLPDesc() {
    const {location} = this.props;
    if (
      location &&
      location.query.dlp_desc &&
      ['developers', 'coders', 'programmers'].indexOf(location.query.dlp_desc) >
      -1
    ) {
      return location.query.dlp_desc;
    }
    return null;
  }

  getDLPPhrase() {
    const tag = this.getDLPTag();
    const desc = this.getDLPDesc();
    if (tag || desc) {
      return `${this.getDLPTag() || 'software'} ${this.getDLPDesc() ||
      'developers'}`;
    }
    return null;
  }

  reorderProfileSkills(skills) {
    let isSkillPage = this.state.isSkillPage,
      {SkillPage: {detail: {skill_page}}} = this.props;
    if (isSkillPage && skill_page.keyword) {
      let new_skills = [skill_page.skill];
      skills.forEach(skill => {
        if (skill.id != skill_page.skill.id) {
          new_skills.push(skill);
        }
      });
      return new_skills;
    }
    return skills;
  }

  renderHeaderContent() {
    let dlp_phrase = this.getDLPPhrase(),
      {SkillPage: {detail: {skill_page, isRetrieving, error}}} = this.props;
    let isSkillPage = this.state.isSkillPage && !error.retrieve;

    return (
      <div>
        <div className="tunga-logo-top">
          <img src={require('../images/logo_round.png')}/>
        </div>
        <div
          className={`head-desc ${isSkillPage && this.getDLPTag().length > 7
            ? 'smaller'
            : 'pull-left'}`}>
          <h1 className="pull-left">
            {isSkillPage && skill_page.welcome_header
              ? <span
                dangerouslySetInnerHTML={{
                  __html: nl_to_br(skill_page.welcome_header),
                }}
              />
              : <span>
                 Unleasing Africa’s Tech Talent
                </span>}
          </h1>
          <div className="details">
            {isSkillPage && skill_page.welcome_sub_header
              ? <span
                dangerouslySetInnerHTML={{
                  __html: nl_to_br(skill_page.welcome_sub_header),
                }}
              />
              : <span className="pull-left">
                  Small and large businesses from all over the world use Tunga
                for hiring African software engineers to address their most
                pressing software development needs.

                </span>}
          </div>
          <div className="details pull-left">
            <a className="btn btn-callout btn-main-cta" href="/call/">
              <i className="tunga-icon-rocket"/>Schedule a call</a>
          </div>


        </div>

      </div>
    );
  }

  render() {
    let slider_settings = {
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
        {breakpoint: 481, settings: {slidesToShow: 1 /*, centerMode: true*/}},
        {breakpoint: 769, settings: {slidesToShow: 2 /*, centerMode: true*/}},
        {
          breakpoint: 1025,
          settings: {slidesToShow: 3, centerMode: true, centerPadding: 0},
        },
      ],
    };

    let meta_title = 'Tunga | Software outsourcing done right';
    let meta_description = `Getting software projects done is hard. We make it easy.`;

    let {SkillPage: {detail: {skill_page, isRetrieving, error}}} = this.props;
    let isSkillPage = this.state.isSkillPage && !error.retrieve;

    return (
      <ShowcaseContainer
        className={`landing-page ${this.state.pageClass} ${isSkillPage &&
        'skill-page'}`}
        headerContent={this.renderHeaderContent()}
        headerVideo={false && this.state.showVideo}
        hasArrow={true}
        chatId={this.props.params ? this.props.params.chatId : null}
        closeChat={this.state.closeChat}>
        <MetaTags title={meta_title} description={meta_description}/>

        {isRetrieving
          ? <Progress/>
          : <div>
            {isSkillPage
              ? <section id="pitch">
                <div className="container text-center">
                  <div className="section-heading">
                    {skill_page.pitch_header}
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: nl_to_br(skill_page.pitch_body),
                    }}
                  />


                </div>
              </section>
              : <div>
                <section id="platform-info">
                  <div className="container">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="workflow">
                          <div className="section-heading">
                            Our unusual approach to software development
                          </div>
                          <p>
                            Software projects often go wrong because of people
                            misunderstanding each other. Tunga was founded by
                            people from the hospitality sector to solve this
                            problem with a simple idea: apply our human-centered
                            mindset to the software development process and its actors.

                            We work with a community of highly talented youths
                            from several African countries, who are committed to
                            go the extra mile for you. Why? Because we not only
                            pay a lot of attention to our managers and developers
                            growing a customer-focused attitude, we also do our utmost
                            to address their needs by creating interesting and
                            worthwhile work opportunities for them.

                            Do you support our mission to create opportunities
                            for African youths?
                            Become a ‘Friend of Tunga’! For each client you refer
                            to us we donate a sum to Bits Academy, a network of
                            African schools that focus on giving quality and
                            free IT-education to youths from less privileged backgrounds.


                            <a
                              href="#"
                              onClick={this.onScheduleCall.bind(this)}>
                              Talk with us
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <img
                          src={require('images/home/Tungadevelopercodingsection2.jpg')}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>}

            <section>
              <div>
                <div className="container">
                  <div className="row skill-page">

                    <div className="col-md-offset-2 col-md-8 section-heading">
                      <p>Software development Tunga-style</p>
                    </div>

                    <div className="col-md-offset-4 col-md-4 col-md-offset-5">
                      <hr className="hr-tunga"/>
                    </div>

                    <div className="col-lg-12">
                      We have built a large pool of top African tech talent that
                      can be deployed flexibly and rapidly to help you meet your
                      specific software development needs.

                    </div>

                    <div className="col-lg-4">

                      <p>We have built a large pool of top African tech talent
                        that can be deployed flexibly and rapidly to help you
                        meet your specific software development needs.
                      </p>


                    </div>
                    <div className="col-lg-4">

                      <p>
                        Quality assured
                        We have developed a unique, highly professional and
                        effective way of working that enables clients and
                        developers from any part of the world to collaborate efficiently.
                      </p>

                    </div>
                    <div className="col-lg-4">


                      <p>
                        Affortable
                        Our developers are for hire at a flat rate of EUR20 per hour.
                        We calculate projects transparently and stick with that.
                        No excuses, no discussions, no additional costs.
                      </p>

                    </div>
                  </div>

                </div>
              </div>

            </section>
            <section id="how-we-verify">
              <div className="container">
                <p className="">Meet our triving community of developers</p>
                <p className="">Find out how we select our developers and meet some of our talented experts.</p>
              </div>
            </section>
            <section id="press">
              <div className="container ">
                <Reveal effect="animated fadeInLeft">
                  <div>
                    <ul className="press-links">
                      <li>
                        <a
                          href="http://www.bbc.co.uk/news/world-africa-38294998"
                          target="_blank">
                          <img src={require('../images/press/bbc.png')}/>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.youtube.com/watch?v=v9uRtYpZDQs"
                          target="_blank">
                          <img
                            src={require('../images/press/campus-party.png')}
                          />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.oneworld.nl/startup-tunga-lanceert-pilot-programma-voor-nieuw-soort-freelance-platform"
                          target="_blank">
                          <img src={require('../images/press/OWlogo.png')}/>
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://trendwatching.com/blog/featured-innovator-tunga/"
                          target="_blank">
                          <img
                            src={require('../images/press/trend-watching.png')}
                          />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://soundcloud.com/african-tech-round-up/a-chat-with-ernesto-spruyt-of-tungaio?in=african-tech-round-up/sets/quick-chats"
                          target="_blank">
                          <img
                            src={require('../images/press/African-Tech-Round-Up.png')}
                          />
                        </a>
                      </li>
                      <li>
                        <a
                          href="http://spendmatters.com/2016/04/01/tunga-wip-of-the-week/"
                          target="_blank">
                          <img
                            src={require('../images/press/Spend-Matters.png')}
                          />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.nabc.nl/africa-business-news/5/technology/377/tunga-founder-ernesto-spruyt-we-create-21st-century-jobs-in-africa"
                          target="_blank">
                          <img
                            src={require('../images/press/netherlands-african-business-council.png')}
                          />
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://blog.tunga.io/our-developers-dont-want-aid-they-want-to-be-productive-4aba9173211e"
                          target="_blank">
                          <img
                            src={require('../images/press/bnr.jpg')}
                          />
                        </a>
                      </li>
                    </ul>
                  </div>
                </Reveal>
              </div>
            </section>
            {isSkillPage
              ? <div>
                {skill_page.profiles && skill_page.profiles.length
                  ? <section id="skill-profiles">
                    <div className="container">
                      <div className="row">
                        {skill_page.profiles.map(profile => {
                          console.log('profile', profile);
                          return (
                            <div className="col-sm-4">
                              <div className="card user-card">
                                <Avatar
                                  src={profile.user.avatar_url}
                                  size="xl"
                                />
                                <div className="name">
                                  {profile.user.display_name}
                                </div>
                                <div>
                                  {profile.user.profile &&
                                  (profile.user.profile.city ||
                                    profile.user.profile.country_name)
                                    ? `${profile.user.profile
                                      .city}, ${profile.user.profile
                                      .country_name}`
                                    : null}
                                </div>
                                <div className="skills">
                                  {this.reorderProfileSkills(
                                    profile.user.profile.skills,
                                  )
                                    .slice(0, 3)
                                    .map(skill => {
                                      return (
                                        <span>
                                                {skill.name}
                                              </span>
                                      );
                                    })}
                                </div>
                                <div
                                  className="intro"
                                  dangerouslySetInnerHTML={{
                                    __html: nl_to_br(profile.intro),
                                  }}
                                />
                                <div>
                                  <Link
                                    to="/start"
                                    className="btn btn-block">
                                    Start working with{' '}
                                    {profile.user.first_name}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                  : null}
                <HowItWorks/>
                <section id="story">
                  <div className="container">
                    <div
                      className="section-heading text-center"
                      dangerouslySetInnerHTML={{
                        __html: nl_to_br(skill_page.story_header),
                      }}
                    />
                    <div
                      className="readable"
                      dangerouslySetInnerHTML={{
                        __html: skill_page.story_body_one,
                      }}
                    />
                  </div>
                  <div
                    id="story-interlude-one"
                    style={
                      skill_page.story_interlude_one_image
                        ? {
                          backgroundImage: `url(${skill_page.story_interlude_one_image})`,
                        }
                        : {}
                    }>
                    <div className="container">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: nl_to_br(
                            skill_page.story_interlude_one_text,
                          ),
                        }}
                      />
                      <Link to="/start" className="cta">
                        {skill_page.story_interlude_one_cta}
                      </Link>
                    </div>
                  </div>
                  <div className="container">
                    <div
                      className="readable"
                      dangerouslySetInnerHTML={{
                        __html: skill_page.story_body_two,
                      }}
                    />
                  </div>

                  <div
                    id="story-interlude-two"
                    style={
                      skill_page.story_interlude_two_image
                        ? {
                          backgroundImage: `url(${skill_page.story_interlude_two_image})`,
                        }
                        : {}
                    }>
                    <div className="container">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: nl_to_br(
                            skill_page.story_interlude_two_text,
                          ),
                        }}
                      />
                    </div>
                  </div>
                  <div className="container">
                    <div
                      className="readable"
                      dangerouslySetInnerHTML={{
                        __html: skill_page.story_body_three,
                      }}
                    />
                  </div>
                </section>
              </div>
              : <div>
                <section id="how-we-verify">
                  <div className="container">
                    <Link to="/quality">How we verify our Developers</Link>
                  </div>
                </section>
                <section id="clients-testmonial">
                  <div className="container">
                    <div className="section-heading text-center">
                      What our clients say
                    </div>
                    <Slider
                      className="testimonials-slider text-center"
                      {...slider_settings}>
                      {TESTIMONIALS.map(testimonial => {
                        return (
                          <div className="testimonial">
                            <div className="body">
                              <div>
                                <i className="fa fa-quote-left pull-left"/>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: testimonial.message,
                                  }}
                                />
                                <i className="fa fa-quote-right pull-right"/>
                              </div>
                            </div>
                            <div
                              className="image"
                              style={{
                                backgroundImage: `url(${testimonial.image})`,
                              }}
                            />
                            <div className="author">
                              {testimonial.name}
                            </div>
                            <div className="company">
                              {testimonial.company}
                            </div>
                          </div>
                        );
                      })}
                    </Slider>
                  </div>
                </section>
                <section>
                  <div className="container">
                    <div className="row skill-page">

                      <div className="col-md-offset-2 col-md-8 section-heading">
                        <p>What we do best</p>
                      </div>

                      <div className="col-md-offset-4 col-md-4 col-md-offset-5">
                        <hr className="hr-tunga"/>
                      </div>
                      <div className="col-lg-12">
                        <div className="col-lg-4">
                          <img src={require('../images/showcase/TungaMobileSkills.png')}/>
                        </div>
                        <div className="col-lg-4">
                          <img src={require('../images/showcase/TungaWebSkills.png')}/>
                        </div>
                        <div className="col-lg-4">
                          <img src={require('../images/showcase/TungaOtherSkills.png')}/>
                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                <section>
                  <div className="container">
                    <div className="row skill-page">

                      <div className="col-md-offset-2 col-md-8 section-heading">
                        <p>Where to find us</p>
                      </div>

                      <div className="col-md-offset-4 col-md-4 col-md-offset-5">
                        <hr className="hr-tunga"/>
                      </div>

                      <div className="col-md-12">
                        <div className="col-md-6">
                          <p>
                            <strong>Kampala office:</strong></p>
                          <p>
                            Design Hub Kampala, 5th Street, Industrial Area, Kampala, Uganda
                          </p>
                          <p>
                            <strong>Amsterdam office:</strong>
                          </p>
                          <p>
                            The Collab, Wibautstraat 131, 1091 GL Amsterdam, The Netherlands
                          </p>

                          <p>
                            <strong>Lagos office:</strong></p>
                          <p>
                            Address, Street, postal code, Lagos, Nigeria
                          </p>

                          <p className="">hello@tunga.io</p>
                          <div>
                            <a className="btn btn-callout" href="/call/">
                              Schedule a call with us</a>
                          </div>

                        </div>
                        <div className="col-md-offset-1 col-md-5">
                          <Form>
                            <FormGroup>
                              <FormControl type="input" placeholder="Your Name"/>
                            </FormGroup>
                            <FormGroup>
                              <FormControl type="input" placeholder="Your email address"/>
                            </FormGroup>
                            <FormGroup>
                              <FormControl componentClass="textarea" placeholder="Type your message here"/>
                            </FormGroup>
                            <br/>
                            <br/>
                            <br/>
                            <div className="pull-right">
                              <Button type="submit">Send</Button>
                            </div>
                          </Form>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>}

            <div className="outsource-widget">
              <div>Ready to outsource the right way?</div>
              <form
                name="task"
                role="form"
                ref="task_form"
                action={`${isTungaDomain()
                  ? ''
                  : 'https://tunga.io'}/start-outsource/`}>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  ref="email"
                  required
                  placeholder="Your email address"
                />
                <button className="btn">Go</button>
              </form>
            </div>
          </div>}

        <ShowCaseFooter/>
      </ShowcaseContainer>
    );
  }
}

function mapStateToProps(state) {
  return {Auth: state.Auth, SkillPage: state.SkillPage};
}

function mapDispatchToProps(dispatch) {
  return {
    SkillPageActions: bindActionCreators(SkillPageActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
