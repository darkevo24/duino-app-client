<template>
  <div>
    <v-text-field
      v-model="url"
      label="Server Address"
      :error-messages="err ? [err] : []"
      @change="checkUrl"
      hint="https://example.com"
      :color="serverData ? 'success' : undefined"
    >
      <template v-slot:label>
        Server Address
        <v-chip v-if="serverData" color="success" small class="py-0">
          Valid
        </v-chip>
      </template>
    </v-text-field>
    <v-btn @click="addServer" class="ml-2" :disabled="!serverData">
      <v-icon left>mdi mdi-plus</v-icon>
      Add Server
    </v-btn>
    <v-snackbar
      v-model="success"
      bottom
      color="success"
      multi-line
      :timeout="5000"
    >
      Successfully added new server
      <v-btn dark text icon @click="success = false">
        <v-icon dark>mdi mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: '',
      serverData: null,
      err: '',
      success: false,
    };
  },
  computed: {
    address() {
      const protocol = this.url.startsWith('http://') ? 'http://' : 'https://';
      return `${protocol}${this.url.trim().replace(/\/$/, '').replace(/^https?:\/\//, '')}`;
    },
  },
  methods: {
    async checkUrl() {
      // Automatically set the URL to the default if it's empty
      if (!this.url) {
        this.url = 'https://compile.duino.app'; // Default URL
      }

      const { Server } = this.$FeathersVuex.api;
      this.serverData = null;
      this.err = '';
      const serv = { address: this.address };

      // Check if the server already exists
      const existingServers = await Server.find({ query: serv });

      // Handle if the server already exists
      if (Array.isArray(existingServers) && existingServers.length) {
        this.err = 'Server already exists.';
        return;
      }

      // Make the server request
      const serverResponse = await this.$compiler.serverReq('info/server', null, serv);

      // Validate the response
      if (!serverResponse) {
        this.err = 'Unable to connect to the server.';
      } else {
        this.serverData = serverResponse; // Assuming the response is valid
      }
      // Check for specific error indications if your API has them
      if (serverResponse && serverResponse.error) {
        this.err = serverResponse.error; // Adapt this based on your API response structure
      }
    },
    async addServer() {
      await this.checkUrl();
      if (!this.serverData) return;
      const { Server } = this.$FeathersVuex.api;
      const server = new Server({
        ...this.serverData,
        isCustom: true,
        address: this.address,
        valid: true,
      });
      await server.save();
      this.url = '';
      this.serverData = null;
      this.success = true;
      this.$store.commit('setCurrentServer', server.uuid);
    },
  },
};
</script>

<style lang="scss" scoped>
div {
  display: flex;
  align-items: baseline;
}
</style>
