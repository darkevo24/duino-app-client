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
        <v-chip v-show="serverData" color="success" small class="py-0">
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
      url: 'https://compile.duino.app', // Set initial server address
      serverData: null,
      err: '',
      success: false,
    };
  },
  computed: {
    address() {
      // Ensure proper protocol handling
      const trimmedUrl = this.url.trim().replace(/\/$/, '').replace(/^https?:\/\//, '');
      const protocol = trimmedUrl.includes('http://') ? 'http://' : 'https://';
      return `${protocol}${trimmedUrl}`;
    },
  },
  methods: {
    async checkUrl() {
      if (!this.url) return;

      const { Server } = this.$FeathersVuex.api;
      this.serverData = null;
      this.err = '';

      const serv = { address: this.address };

      // Check if the server already exists
      const existingServers = await Server.find({ query: serv });
      if (existingServers.length) {
        this.err = 'Server already exists.';
        return;
      }

      try {
        this.serverData = await this.$compiler.serverReq('info/server', null, serv);
      } catch (error) {
        console.error(error);
        this.err = 'Invalid server address.';
      }

      // Set error if serverData is still null after the request
      if (!this.serverData) {
        this.err = 'Unable to connect to the server.';
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

      // Save the new server
      await server.save();
      this.url = 'https://compile.duino.app'; // Reset to initial server address
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
