export class Section {
	private datasetId: string;
	private uuid: string;
	private id: string;
	private title: string;
	private instructor!: string;
	private dept!: string;
	private year!: number;
	private avg!: number;
	private pass!: number;
	private fail!: number;
	private audit!: number;

	constructor(datasetId: string, sectionObj: {[key: string]: any}) {
		this.datasetId = datasetId;
		this.uuid = sectionObj.uuid;
		this.id = sectionObj.id;
		this.title = sectionObj.title;
		this.instructor = sectionObj.instructor;
		this.dept = sectionObj.dept;
		this.year = sectionObj.year;
		this.avg = sectionObj.avg;
		this.pass = sectionObj.pass;
		this.fail = sectionObj.fail;
		this.audit = sectionObj.audit;
	}
}
