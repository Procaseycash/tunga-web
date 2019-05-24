import PropTypes from 'prop-types';
import React from 'react';
import {Link, NavLink} from 'react-router-dom';
import _ from 'lodash';
import CopyToClipboard from 'react-copy-to-clipboard';

import Avatar from './core/Avatar';
import Icon from './core/Icon';
import SearchBox from './core/SearchBox';
import Button from "./core/Button";
import {proxySafeUrl} from "./utils/proxy";
import OverlayTooltip from "./core/OverlayTooltip";
import {openCalendlyWidget} from "./utils/calendly";


export default class NavBar extends React.Component {
    static defaultProps = {
        variant: 'dashboard',
        breakpoint: 'md',
        isLargeDevice: false
    };

    static propTypes = {
        variant: PropTypes.string,
        className: PropTypes.string,
        user: PropTypes.object,
        onSignOut: PropTypes.func,
        breakpoint: PropTypes.string,
        isLargeDevice: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {copied: false};
    }

    componentDidMount() {
        let updateNavbar = function() {
            let windowWidth = $(window).innerWidth();
            if (windowWidth >= 768) {
                if ($(document).scrollTop() >= 20) {
                    $('.navbar').addClass('navbar-showcase-fixed');
                } else {
                    $('.navbar').removeClass('navbar-showcase-fixed');
                }
            }
        };

        const {variant} = this.props;
        if(variant === 'showcase') {
            $(document).ready(updateNavbar);
            $(document).scroll(updateNavbar);
            $(window).resize(updateNavbar);
        }
    }

    onSignOut(e) {
        if(e) {
            e.preventDefault();
        }
        if(this.props.onSignOut) {
            this.props.onSignOut();
        }
    }

    setCopied = () => {
        this.setState({copied: true});
    };

    clearCopied = () => {
        let self = this;
        // user timer to prevent flicker
        setTimeout(() => {
            if (self.state.copied) {
                this.setState({copied: false});
            }
        }, 1000);
    };

    render() {
        let {user, variant, breakpoint, className, isLargeDevice} = this.props;

        return (
            <nav className={`navbar navbar-expand-${breakpoint || 'md'} fixed-top navbar-dark ${className || ''} ${variant?`navbar-${variant}`:''}`} >
                <Link to={`/${variant === 'dashboard'?'dashboard':''}`} className="navbar-brand">
                    <img src={require('../assets/images/logo.png')} />
                </Link>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
                    <i className="tg-ic-bars"/>
                </button>
                <div className="collapse navbar-collapse" id="navbar">
                    {variant === 'showcase'?(
                        <ul className="navbar-nav navbar-main">
                            <li>
                                <NavLink to={proxySafeUrl("/our-story")} activeClassName="active">
                                    Our Story
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={proxySafeUrl("/quality")} activeClassName="active">
                                    Quality
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={proxySafeUrl("/pricing")} activeClassName="active">
                                    Pricing
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={proxySafeUrl("/researchpapers/how-to-use-remote-workers-for-scaling-your-software-development-team/")} activeClassName="active">
                                    Research Paper
                                </NavLink>
                            </li>
                            <li>
                                <a href="https://blog.tunga.io" target="_blank">
                                    Blog
                                </a>
                            </li>
                        </ul>
                    ):null}
                    <ul className="navbar-nav ml-auto">
                        {user && user.id?(
                            <React.Fragment>
                                {variant === 'showcase'?null:(
                                    <li>
                                        <SearchBox variant="search"/>
                                    </li>
                                )}
                                <li className="nav-item dropdown">
                                    <a
                                        href="#"
                                        className="dropdown-toggle"
                                        data-toggle="dropdown"
                                        role="button"
                                        aria-haspopup="true"
                                        aria-expanded="false">
                                        <span className="user-name">{isLargeDevice?user.display_name:_.truncate(user.display_name, {length: 12})}</span> <span className="caret"/> <Avatar image={user.avatar_url} size={isLargeDevice?null:'xs'}/>
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-account">
                                        <li>
                                            {variant === 'dashboard'?null:(
                                                <Link to="/dashboard">
                                                    <Icon name="meter" size="navbar"/> Dashboard
                                                </Link>
                                            )}
                                            <Link to="#" onClick={this.onSignOut.bind(this)}>
                                                <Icon name="logout" size="navbar"/> Sign Out
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </React.Fragment>
                        ):(
                            <React.Fragment>
                                {isLargeDevice?(
                                    <li>
                                        <Button className="btn-call" onClick={() => { openCalendlyWidget() }}>
                                            <Icon name="calendar"/>&nbsp;&nbsp;&nbsp;Schedule a call
                                        </Button>
                                        {/*
                                        <CopyToClipboard text="+31 20 220 2157">
                                            <OverlayTooltip placement="left"
                                                            overlay={
                                                                <strong>Cop{this.state.copied?'ied':'y'}</strong>
                                                            }>
                                                <Button className="btn-call" onClick={this.setCopied} onMouseOut={this.clearCopied}>
                                                    <Icon name="phone"/> +31 20 220 2157
                                                </Button>
                                            </OverlayTooltip>
                                        </CopyToClipboard>
                                        */}
                                    </li>
                                ):null}
                                <li>
                                    <Link
                                        to={proxySafeUrl("/signin")}
                                        className="btn btn-auth">
                                        Login
                                    </Link>
                                </li>
                            </React.Fragment>
                        )}
                    </ul>
                </div>

            </nav>
        );
    }
}
