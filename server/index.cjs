/* cPanel Passenger compatible CommonJS entry for Next.
 * - When required by Passenger: exports an Express app without calling listen.
 * - When run directly: starts listening on PORT.
 */
const path = require("path");
const http = require("http");

const appDir = path.join(__dirname, "..", "frontend");
const next = require("next");
const nextApp = next({ dev: false, dir: appDir });
const handle = nextApp.getRequestHandler();
const ready = nextApp.prepare();

function passengerHandler(req, res) {
  ready
    .then(() => handle(req, res))
    .catch((error) => {
      res.statusCode = 500;
      res.end("Server error");
      // eslint-disable-next-line no-console
      console.error(error);
    });
}

module.exports = passengerHandler;

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  http.createServer(passengerHandler).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[trydelta] listening on :${port}`);
  });
}
