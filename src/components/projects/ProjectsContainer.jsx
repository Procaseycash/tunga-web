import React from 'react';
import { Switch, Route } from 'react-router-dom';
import randomstring from 'randomstring';

import connect from '../../connectors/ProjectConnector';

import ProjectListContainer from './ProjectListContainer';
import ProjectList from './ProjectList';
import ProjectDetailContainer from './ProjectDetailContainer';
import ProjectManagement from "./ProjectManagement";
import ProjectForm from "./ProjectForm";


class ProjectsContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {targetKey: randomstring.generate()};
    }

    onCreateProject(project) {
        const {ProjectActions} = this.props;
        ProjectActions.createProject(project, this.state.targetKey);
    }

    render() {
        const {Project, ProjectActions} = this.props, targetKey = this.state.targetKey;

        return (
            <React.Fragment>
                <Switch>
                    <Route exact path="/projects/new" render={props => <ProjectForm {...props} project={Project.created[targetKey] || null} isSaving={Project.isSaving[targetKey] || false} isSaved={Project.isSaved[targetKey] || false} errors={Project.errors.create || null} onCreate={this.onCreateProject.bind(this)}/>}/>
                    <Route path="/projects/:projectId" render={props => <ProjectDetailContainer {...props} projectId={props.match.params.projectId} Project={Project} ProjectActions={ProjectActions}><ProjectManagement {...props}/></ProjectDetailContainer>}/>
                    {[
                        '/project/filter/:filter',
                        '/projects',
                    ].map(path => {
                        return (
                            <Route key={`project-container-path--${path}`} path={path} render={props => <ProjectListContainer {...props} Project={Project} ProjectActions={ProjectActions}><ProjectList/></ProjectListContainer>}/>
                        );
                    })}
                </Switch>
            </React.Fragment>
        );
    }
}

export default connect(ProjectsContainer);
