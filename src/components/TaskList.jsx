import React from 'react';
import {Link, NavLink} from 'react-router-dom';

import Progress from './status/Progress';
import LoadMore from './status/LoadMore';
import TaskCard from './TaskCard';
import SearchBox from './SearchBox';
import GenericListContainer from '../containers/GenericListContainer';

import {isAdmin, isDeveloper, isProjectManager} from '../utils/auth';

export default class TaskList extends GenericListContainer {
  componentDidUpdate(prevProps, prevState) {
    super.componentDidUpdate(prevProps, prevState);

    if (
      prevProps.location &&
      this.props.location &&
      prevProps.location.pathname != this.props.location.pathname
    ) {
      this.getList();
    }

    if (prevProps.search != this.props.search) {
      this.setState({
        selection_key: this.state.selection_key + (this.props.search || ''),
        prev_key: this.state.selection_key,
      });
    }
  }

  getList(filters) {
    this.props.TaskActions.listTasks(
      {
        filter: this.getFilter(),
        skill: this.getSkill(),
        ...this.props.filters,
        search: this.props.search,
        ...(filters || {}),
      },
      this.state.selection_key,
      this.state.prev_key,
    );
  }

  getFilter() {
    if (this.props.params && this.props.params.filter) {
      return this.props.params.filter;
    }
    return null;
  }

  getSkill() {
    if (this.props.params && this.props.params.skill) {
      return this.props.params.skill;
    }
    return null;
  }

  render() {
    const {Task, TaskActions, hide_header, emptyListText} = this.props;
    let filter = this.getFilter();
    let skill = this.getSkill();

    const all_tasks = Task.list.ids[this.state.selection_key] || [];

    return (
      <div>
        {hide_header
          ? null
          : <div>
              <div className="clearfix">
                <h2 className="pull-left">
                  {filter == 'my-tasks' && !isDeveloper() ? 'My ' : ''}Work
                </h2>
                <div className="pull-right">
                  <SearchBox
                    placeholder="Search tasks"
                    onSearch={this.getList.bind(this)}
                    count={Task.list.count}
                  />
                </div>
              </div>
              {filter == 'my-tasks' && !isDeveloper()
                ? null
                : <ul className="nav nav-pills nav-top-filter">
                    <li role="presentation">
                      <NavLink to="/work" activeClassName="active">
                        All
                      </NavLink>
                    </li>
                    {isProjectManager() || isAdmin()
                      ? [
                          <li role="presentation" key="new-projects">
                            <NavLink
                              to="/work/filter/new-projects"
                              activeClassName="active">
                              <i className="tunga-icon-project" /> New Projects
                            </NavLink>
                          </li>,
                          <li role="presentation" key="proposals">
                            <NavLink
                              to="/work/filter/proposals"
                              activeClassName="active">
                              <i className="fa fa-pie-chart" /> Estimates
                            </NavLink>
                          </li>,
                        ]
                      : null}
                    <li role="presentation">
                      <NavLink to="/work/filter/running" activeClassName="active">
                        <i className="tunga-icon-running-tasks" /> Running
                      </NavLink>
                    </li>
                    {isDeveloper() || isAdmin()
                      ? [
                          <li
                            role="presentation"
                            key="skills"
                            style={{marginLeft: '20px'}}>
                            <NavLink
                              to="/work/filter/skills"
                              activeClassName="active">
                              My Skills
                            </NavLink>
                          </li>,
                          <li role="presentation" key="clients">
                            <NavLink
                              to="/work/filter/project-owners"
                              activeClassName="active">
                              My Clients
                            </NavLink>
                          </li>,
                        ]
                      : null}
                    {skill
                      ? <li role="presentation" style={{marginLeft: '20px'}}>
                          <NavLink
                            to={`/work/skill/${skill}`}
                            activeClassName="active">
                            <i className="tunga-icon-tag" /> {skill}
                          </NavLink>
                        </li>
                      : null}
                  </ul>}
            </div>}
        {Task.list.isFetching
          ? <Progress />
          : <div>
              <div className="row flex-row">
                {all_tasks.map(id => {
                  const task = Task.list.tasks[id];
                  return (
                    <div className="col-sm-6 col-md-4" key={id}>
                      <TaskCard
                        Task={Task}
                        task={task}
                        TaskActions={TaskActions}
                      />
                    </div>
                  );
                })}
              </div>
              {all_tasks.length
                ? Task.list.next
                  ? <LoadMore
                      url={Task.list.next}
                      callback={x => {
                        TaskActions.listMoreTasks(x, this.state.selection_key);
                      }}
                      loading={Task.list.isFetchingMore}
                    />
                  : null
                : <div className="alert alert-info">
                    {emptyListText}
                  </div>}
            </div>}
      </div>
    );
  }
}

TaskList.propTypes = {
  emptyListText: React.PropTypes.string,
};

TaskList.defaultProps = {
  emptyListText: 'No tasks match your query',
};
