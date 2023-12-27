# Control Center
CMS Control Center for Client Portal


# Development guidelines
We are standardizing our development process across our products, you can check the link bellow to understand more how we work:
[Payperform Guidelines](https://payperform.atlassian.net/wiki/spaces/TECH/pages/1486913869/GitHub+Version+Control)


# Getting started
We use a private npm package to create out company interfaces, [Design System](https://github.com/orgs/PayConstruct/packages?repo_name=design-system), in order to use private packages you need to be authenticated.

1. Create a GitHub PAT(Personal Access Token), you **only need read/write packages permission** nothing else
2. Edit you global .npmrc file to include github as a registry with you new generated PAT.
3. Add this to you file, **you don't need to remove what you already have there**, just add this on top:
```
registry=https://registry.npmjs.org/
//npm.pkg.github.com/:_authToken=YOUR_NEW_PAT_HERE
```
**Without this, you can not pull from private packages, be sure to follow the above steps**


# Work in progress