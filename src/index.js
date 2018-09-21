import glob from 'glob'

export default () => ({
  "client/utils/display.js": {
    default: ["client/components/A.js", "client/components/B.js"],
    Display: ["client/components/C.js"]
  },
  "client/utils/camelcase.js": {
    default: []
  }
});

const searchDirectory = (path) => {
	return glob.sync(`./**/*.js`, {cwd: path})
}

export { searchDirectory }
