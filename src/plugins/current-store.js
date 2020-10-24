// import moment from 'dayjs';
import store from '../store';

class CurrentStore {
  constructor() {
    store.subscribe((mutation) => {
      if (mutation.type === 'setCurrentProject') {
        this.currentProjectFile();
      }
    });
  }

  install(Vue) {
    // eslint-disable-next-line no-param-reassign
    Vue.$currentStore = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$currentStore = this;
    this.Vue = Vue;
  }

  async currentProjectFile() {
    const { File, Project } = this.Vue.$FeathersVuex.api;
    const [project] = (await Project.find({ query: { id: store.getters.currentProject } })).data;
    if (!project) return;
    const [file] = await File.find({ query: { projectId: project.id, main: true } });
    if (file) store.commit('setCurrentFile', file.id);
  }
}

export default new CurrentStore();
