import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import InsightFacade from "../controller/InsightFacade";
import {InsightDataset, InsightDatasetKind, InsightError, ResultTooLargeError} from "../controller/IInsightFacade";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	public static facade: InsightFacade;

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();
		Server.facade = new InsightFacade();

		this.registerMiddleware();
		this.registerRoutes();

		/** NOTE: you can serve static frontend files in from your express server
		 * by uncommenting the line below. This makes files in ./frontend/public
		 * accessible at http://localhost:<port>/
		 */
		this.express.use(express.static("./frontend/dist"));
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				// console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					// console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				// console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg/", Server.echo);

		// TODO: your other endpoints should go here
		this.express.post("/query", Server.postMethod);
		this.express.get("/datasets", Server.getMethod);
		this.express.delete("/dataset/", Server.deleteMethod);
		this.express.delete("/dataset/:id", Server.deleteMethod);
		this.express.put("/dataset/:id/:kind", Server.putMethod);
		this.express.put("/dataset/:id", Server.putMethod);
		this.express.put("/dataset", Server.putMethod);
	}

	private static async postMethod(req: Request, res: Response) {
		try {
			const query = req?.body ?? "";
			const queryResult = await Server.facade.performQuery(query);
			res.status(200).json({result: queryResult});
		} catch(e) {
			res.status(400).json({error: (e as Error).message});
		}
	}

	private static async getMethod(req: Request, res: Response) {
		let list = await Server.facade.listDatasets();
		res.status(200).json({result: list});
	}

	private static async deleteMethod(req: Request, res: Response) {
		try {
			const response = await Server.facade.removeDataset(req.params?.id ?? "");
			res.status(200).json({result: response});
		} catch (err) {
			if((err as Error).constructor === InsightError) {
				res.status(400).json({error: (err as Error).message});
			} else {
				res.status(404).json({error: (err as Error).message});
			}
		}
	}

	private static async putMethod(req: Request, res: Response) {
		try {
			console.log(req.params.id);
			const response = await Server.facade.addDataset(
				req.params?.id ?? "",
				(req.body as Buffer).toString("base64"),
				(req.params.kind as InsightDatasetKind));
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: (err as Error).message});
		}
	}

	/**
	 * The next two methods handle the echo service.
	 * These are almost certainly not the best place to put these, but are here for your reference.
	 * By updating the Server.echo function pointer above, these methods can be easily moved.
	 */
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}
}
