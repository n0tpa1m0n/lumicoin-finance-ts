export type RouteTypes ={
        route: string;
        title: string;
        filePathTemplate: string;
        useLayout: string;
        requiresAuth:boolean,
        load(): Promise<void>;
        unload?():void;
        styles?(): string[];
}