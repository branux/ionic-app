'use strict';
declare var plugin: any;
import { Page, NavParams } from 'ionic-angular';
import { UPDATE_TIMEOUT } from '../../const';
import { GoogleMaps } from '../../components/maps/controller';
import { SearchService } from '../../services/search';
import { Bus } from '../../models/bus';
import { Line, Itinerary } from '../../models/itinerary';
import { ItineraryManager } from '../../managers/itinerary';

@Page({
    templateUrl: 'build/pages/map/template.html',
    directives: [GoogleMaps],
})
export class MapPage {

    private params: NavParams;
    private service: SearchService;
    private manager: ItineraryManager;
    private title: string = 'Rio Bus';
    private timer: any;
    public buses: Bus[];
    public line: Line;
    public trajectory: Itinerary;

    public get Title(): string {
        return this.title.replace(',', ', ');
    }

    constructor(params: NavParams, service: SearchService, manager: ItineraryManager) {
        this.params = params;
        this.service = service;
        this.manager = manager;

        if (this.params.data.line) {
            this.line = this.params.data.line;
            this.title = this.line.Line;
        }
        else if (this.params.data.query) {
            this.title = this.params.data.query;
        }
    }

    public onPageLoaded(): void {
        this.showTrajectory();
        this.updateMarkers();
        this.timer = setInterval(() => this.updateMarkers(), UPDATE_TIMEOUT);
    }

    private showTrajectory(): void {
        if (this.title.split(',').length === 1)
            this.manager.getByLine(this.title).then(itinerary => this.trajectory = itinerary);
    }

    private updateMarkers(): void {
        this.service.getBuses(this.title).then((buses: Bus[]) => this.buses = buses, error => {
            this.buses = [];
            clearInterval(this.timer);
            if (error.status === 404) console.log(`[404] No buses were found the the query '${this.title}'.`);
            else console.log(`[${error.status}] An error ocurred.`);
        });
    }

    public onPageWillLeave(): void {
        clearInterval(this.timer);
    }
}
