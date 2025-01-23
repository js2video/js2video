<script setup>
import DefaultTheme from "vitepress/theme";
const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-before>
      <div
        style="
          text-align: center;
          background-color: #ffed87;
          padding: 4px;
          color: black;
          font-size: 0.8em;
          font-weight: 500;
          margin-bottom: 30px;
        "
      >
        WORK IN PROGRESS - Don't use this library in production yet! Breaking
        changes will happen.
      </div>
    </template>
  </Layout>
</template>
