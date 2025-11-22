<template>
  <div class="app-layout">
    <!--NavBar component locaiton when created-->
    <!--
        <nav class="navbar" />
        -->
    <div class="layout-body">
      <!--Sidebar component location when created-->
      <!--
            <Sidebar class="sidebar" / >
            -->
      <main class="main-content">
        <slot></slot>
        <!--Page renders here-->
      </main>
    </div>
  </div>
</template>
