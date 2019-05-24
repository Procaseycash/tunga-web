import React from 'react';

import connect from '../../connectors/AuthConnector';

import Progress from '../core/Progress';
import Error from '../core/Error';
import Success from '../core/Success';
import FieldError from '../core/FieldError';
import SocialSignIn from '../core/SocialSignIn';
import MetaTags from '../MetaTags';

import {USER_TYPE_DEVELOPER, USER_TYPE_PROJECT_OWNER} from '../../actions/utils/api';
import PropTypes from "prop-types";
import Button from "../core/Button";

class SignUp extends React.Component {

    static defaultProps = {
        confirmationKey: null,
        invitationKey: null,
    };

    static propTypes = {
        confirmationKey: PropTypes.string,
        invitationKey: PropTypes.string,
    };


    componentDidMount() {
        let confirmationKey = this.props.confirmationKey;
        if (confirmationKey) {
            this.props.AuthActions.retrieveApplication(confirmationKey);
        }

        let invitationKey = this.props.invitationKey;
        if (invitationKey) {
            this.props.AuthActions.retrieveInvite(invitationKey);
        }
    }

    componentDidUpdate(prevProps, prevState, snapShot) {
        if (this.props.Auth.isRegistered && !prevProps.Auth.isRegistered) {
            this.refs.signup_form.reset();
            if (
                this.props.confirmationKey ||
                this.props.invitationKey
            ) {
                this.props.AuthActions.verify();
            }
        }
    }

    onSignUp(e) {
        e.preventDefault();
        const {Auth} = this.props;
        const {application, invitation} = Auth;

        let confirmationKey = this.props.confirmationKey,
            invitationKey = this.props.invitationKey;
        let username = this.refs.username.value.trim(),
            first_name = null,
            last_name = null,
            email = null;

        if (confirmationKey) {
            first_name = application.first_name;
            last_name = application.last_name;
            email = application.email;
        } else {
            first_name = this.refs.first_name.value.trim();
            last_name = this.refs.last_name.value.trim();

            if (invitationKey) {
                email = invitation.email;
            } else {
                email = this.refs.email.value.trim();
            }
        }

        let password1 = this.refs.password1.value.trim(),
            password2 = this.refs.password2.value.trim(),
            user_type =
            confirmationKey || invitationKey
                ? USER_TYPE_DEVELOPER
                : USER_TYPE_PROJECT_OWNER;

        this.props.AuthActions.register({
            username,
            email,
            password1,
            password2,
            first_name,
            last_name,
            type: user_type,
            key: confirmationKey,
            invite_key: invitationKey,
        });
    }

    render() {
        const {Auth} = this.props;
        const {application, invitation} = Auth;

        let confirmationKey = this.props.confirmationKey,
            invitationKey = this.props.invitationKey,
            is_applying_developer = !!confirmationKey,
            is_invited_user = !!invitationKey,
            is_pre_approved = is_applying_developer || is_invited_user;

        return (
            <div className="auth-page">
                <MetaTags title={'Sign Up'} description={'Sign Up to hire skilled African developers ready work on your software project.'} />

                <header className="height-100">
                    <div className="container">
                        <h2 className="text-center">
                            Create your Tunga account{is_applying_developer
                            ? ' as a developer'
                            : ''}
                        </h2>

                        <div className="auth-form-wrapper">
                            {(Auth.isRetrievingApplication && is_applying_developer) ||
                            (Auth.isRetrievingInvitation && is_invited_user) ? (
                                <Progress />
                            ) : is_pre_approved && !application.id && !invitation.id ? (
                                <Error message="Oops! We couldn't find your invite."/>
                            ) : (
                                <form
                                    onSubmit={this.onSignUp.bind(this)}
                                    name="signup"
                                    role="form"
                                    ref="signup_form">
                                    {/*is_pre_approved ? null : (
                                        <div>
                                            <p className="text-center">Sign up with</p>

                                            <SocialSignIn
                                                user_type={USER_TYPE_PROJECT_OWNER}
                                                action="register"
                                            />

                                            <p className="text-center">or</p>
                                        </div>
                                    )*/}

                                    {Auth.isRegistering ? <Progress /> : null}

                                    {Auth.isRegistered ? (
                                        <Success
                                            message={`Your account has been created successfully. ${
                                                is_pre_approved
                                                    ? ''
                                                    : 'Please check your e-mail for further instructions.'
                                                }`}
                                        />
                                    ) : null}

                                    {Auth.error.register ? (
                                        <Error
                                            message={
                                                Auth.error.register.non_field_errors ||
                                                'Please correct the errors below'
                                            }
                                        />
                                    ) : null}

                                    {is_pre_approved ? (
                                        <div>
                                            {is_applying_developer ? (
                                                <p>
                                                    Name:{' '}
                                                    <strong>
                                                        {application.display_name}
                                                    </strong>
                                                </p>
                                            ) : null}

                                            <p>
                                                Email:{' '}
                                                <strong>
                                                    {application.email ||
                                                    invitation.email}
                                                </strong>
                                            </p>
                                        </div>
                                    ) : null}

                                    {Auth.error.register &&
                                    Auth.error.register.username ? (
                                        <FieldError
                                            message={Auth.error.register.username}
                                        />
                                    ) : null}
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            ref="username"
                                            required
                                            placeholder="Username"
                                        />
                                    </div>

                                    {is_applying_developer ? null : (
                                        <div>
                                            {Auth.error.register &&
                                            Auth.error.register.first_name ? (
                                                <FieldError
                                                    message={
                                                        Auth.error.register.first_name
                                                    }
                                                />
                                            ) : null}
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="fname"
                                                    ref="first_name"
                                                    required
                                                    placeholder="First name"
                                                    defaultValue={
                                                        invitation.first_name || ''
                                                    }
                                                />
                                            </div>

                                            {Auth.error.register &&
                                            Auth.error.register.last_name ? (
                                                <FieldError
                                                    message={
                                                        Auth.error.register.last_name
                                                    }
                                                />
                                            ) : null}
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lname"
                                                    ref="last_name"
                                                    required
                                                    placeholder="Last name"
                                                    defaultValue={
                                                        invitation.last_name || ''
                                                    }
                                                />
                                            </div>

                                            {Auth.error.register &&
                                            Auth.error.register.email ? (
                                                <FieldError
                                                    message={Auth.error.register.email}
                                                />
                                            ) : null}
                                            {is_invited_user ? null : (
                                                <div className="form-group">
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        id="email"
                                                        ref="email"
                                                        required
                                                        placeholder="Email"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {Auth.error.register &&
                                    Auth.error.register.password1 ? (
                                        <FieldError
                                            message={Auth.error.register.password1}
                                        />
                                    ) : null}
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="pwd"
                                            ref="password1"
                                            required
                                            placeholder="Password"
                                        />
                                    </div>

                                    {Auth.error.register &&
                                    Auth.error.register.password2 ? (
                                        <FieldError
                                            message={Auth.error.register.password2}
                                        />
                                    ) : null}
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="pwd-confirm"
                                            ref="password2"
                                            required
                                            placeholder="Confirm Password"
                                        />
                                    </div>

                                    <div className="text-center">
                                        <Button
                                            type="submit"
                                            disabled={Auth.isRegistering}>
                                            Sign up
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </header>
            </div>
        );
    }
}

export default connect(SignUp);
