import React from 'react';
import PropTypes from "prop-types";
import {Switch, Route, Redirect} from 'react-router-dom';

import NavBar from '../NavBar';
import Home from "./Home";
import OurStory from "./OurStory";
import Quality from "./Quality";
import Pricing from "./Pricing";
import Friends from "./Friends";
import FriendsRules from "./FriendsRules";
import Privacy from "./Privacy";
import Agreement from "./Agreement";
import CodeOfConduct from "./CodeOfConduct";
import Maintenance from "./Maintenance";
import SkillPage from "./SkillPage";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import PasswordReset from "./PasswordReset";
import PasswordResetConfirm from "./PasswordResetConfirm";
import Developer from "./Developer";
import DeveloperSearch from "./DeveloperSearch";
import Join from "./Join";
import InterestPollDetailContainer from "../dashboard/projects/InterestPollDetailContainer";
import InterestPoll from "./InterestPoll";
import WhitePaper from "./WhitePaper";
import ResearchPaper from "./ResearchPaper";

export default class ShowcaseLayout extends React.Component {

    static propTypes = {
        user: PropTypes.object,
        logout: PropTypes.func,
        match: PropTypes.object,
    };

    componentDidMount() {
        $('body').removeClass('is-dashboard');
    }

    render() {
        const {user, logout, match, isLargeDevice} = this.props,
            isAgreementPage = /^\/(privacy|agreement|code-of-conduct)(\/|$)/ig.test(window.location.pathname);

        const urlPrefix = match.url === '/tunga'?'/tunga':'';
        const wrapPath = (path) => {
            return `${urlPrefix}${path}`;
        };

        return (
            <div className="showcase">
                <NavBar variant="showcase" user={user}
                        onSignOut={logout}
                        isLargeDevice={isLargeDevice}
                        className={isAgreementPage?'navbar-showcase-always-fixed':''}/>

                <Switch>
                    <Route exact path='/maintenance' component={Maintenance}/>
                    {user && user.id?(
                        'signin|signup|reset-password|start|start-welcome|start-outsource|quiz|customer|join'.split('|').map(path => {
                            return (
                                <Redirect key={`app-path--${path}`} from={`/${path}`} to="/dashboard"/>
                            );
                        })
                    ):(
                        [
                            <Route exact path='/signin' component={SignIn}/>,
                            ['/invite/:invitationKey', '/developer/invite/:invitationKey', '/developer/:confirmationKey'].map(path => {
                                return (
                                    <Route key={`app-path--${path}`} exact path={`/signup${path}`} render={props =>
                                        <SignUp {...props}
                                                confirmationKey={props.match.params.confirmationKey}
                                                invitationKey={props.match.params.invitationKey}
                                        />}
                                    />
                                );
                            }),
                            <Route exact path='/password/:uid/:token' render={props =>
                                <PasswordResetConfirm uid={props.match.params.uid}
                                                      token={props.match.params.token} newUser={true}/>}
                            />,
                            <Route exact path='/reset-password/confirm/:uid/:token' render={props =>
                                <PasswordResetConfirm uid={props.match.params.uid}
                                                      token={props.match.params.token}/>}
                            />,
                            <Route exact path='/reset-password' component={PasswordReset}/>,
                            <Redirect from="/start*" to='/call'/>,
                            <Route exact path='/start' component={Maintenance}/>,
                            <Route exact path='/start-welcome' component={Maintenance}/>,
                            <Route exact path='/start-outsource' component={Maintenance}/>,
                            <Route exact path='/quiz' component={Maintenance}/>,
                            <Route exact path='/customer/help/:chatId' component={Home}/>,
                            <Redirect from="/signup" to='/signin'/>,
                            <Route exact path='/join' component={Join}/>
                        ]
                    )}
                    <Route exact path='/developers'
                           render={props => <DeveloperSearch {...props}/>}/>
                    {user && user.id?(
                        <Redirect from="/developer*" to="/network*"/>
                    ):(
                        <Route exact path='/developer/:username'
                               render={props => <Developer username={props.match.params.username} {...props}/>}/>
                    )}
                    <Route path={wrapPath('/our-story')} component={OurStory}/>
                    <Route path={wrapPath('/quality')} component={Quality}/>
                    <Route path={wrapPath('/pricing')} component={Pricing}/>
                    <Route path={wrapPath('/friends/rules')} component={FriendsRules}/>
                    <Route path={wrapPath('/friends')} component={Friends}/>
                    <Route path={wrapPath('/privacy')} component={Privacy}/>
                    <Route path={wrapPath('/agreement')} component={Agreement}/>
                    <Route path={wrapPath('/code-of-conduct')} component={CodeOfConduct}/>
                    <Route path={wrapPath('/whitepapers/best-african-countries-for-sourcing-software-developers-in-2019')} component={WhitePaper} />
                    <Route path={wrapPath('/researchpapers/how-to-use-remote-workers-for-scaling-your-software-development-team')} component={ResearchPaper} />
                    <Route exact path='/poll/:id/:token' render={props =>
                        <InterestPollDetailContainer pollId={props.match.params.id} >
                            <InterestPoll {...props}/>
                        </InterestPollDetailContainer>}
                    />
                    <Route exact path='/call' render={props => <Home showCall={true}/>}/>
                    <Route exact path='/tunga' component={Home}/>
                    <Route exact path={wrapPath('/:keyword')} render={(props) => <SkillPage keyword={props.match.params.keyword}/>}/>
                    <Route exact path='/' component={Home}/>
                    <Redirect from="/friends-of-tunga" to='/friends'/>
                    <Redirect from="/friends-of-tunga-rules" to='/friends/rules'/>
                    <Redirect from="*" to='/'/>
                </Switch>
            </div>
        )
    }
}
