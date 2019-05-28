import React from 'react';
import {Link} from 'react-router-dom';

import Progress from '../core/Progress';
import Error from '../core/Error';
import SocialSignIn from '../core/SocialSignIn';
import MetaTags from '../MetaTags';

import connect from '../../connectors/AuthConnector';
import Button from "../core/Button";


class SignIn extends React.Component {

    onSignIn = e => {
        e.preventDefault();
        let username = this.refs.username.value.trim(),
            password = this.refs.password.value.trim();
        if (!password || !username) {
            return;
        }

        this.props.AuthActions.authenticate({
            username,
            password,
        });
    };

    render() {
        const {Auth} = this.props;

        return (
            <div className="auth-page">
                <MetaTags title={'Sign In'} description={'Sign In to hire skilled African developers ready work on your software project.'} />

                <header className="height-100">
                    <div className="container">
                        <form onSubmit={this.onSignIn} name="signin" role="signin">

                            <h2 className="text-center">Sign In</h2>
                            {/*
                            <p className="text-center">Sign in with</p>

                            <SocialSignIn />

                            <p className="text-center">or</p>
                            */}

                            {Auth.isAuthenticating ? <Progress /> : ''}
                            {Auth.error.auth ? (
                                <Error
                                    message={
                                        Auth.error.auth.non_field_errors ||
                                        "Sorry, we couldn't log you in. Please try again."
                                    }
                                />
                            ) : (
                                ''
                            )}

                            <div className="form-group">
                                <label className="control-label" htmlFor="username">
                                    Username or Email
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="username"
                                    ref="username"
                                    required
                                    placeholder="Username or Email"
                                />
                            </div>

                            <div className="form-group">
                                <label className="control-label" htmlFor="pwd">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="pwd"
                                    ref="password"
                                    required
                                    placeholder="Password"
                                />
                            </div>

                            <div className="clearfix">
                                <Link to="/reset-password" className="forgot_passwd">
                                    Forgot Password?
                                </Link>

                                <Button
                                    type="submit"
                                    className="float-right"
                                    disabled={Auth.isAuthenticating}>
                                    Sign In
                                </Button>
                            </div>
                        </form>
                    </div>
                </header>
            </div>
        );
    }
}

export default connect(SignIn);
