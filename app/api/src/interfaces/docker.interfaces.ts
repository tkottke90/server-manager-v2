
/**
 * Base class for HTTP requests to the docker socket 
 */
export class DockerRequest {
    public path: string;
    public method: string = 'GET';
    public socketPath: string = '/var/run/docker.sock';
}

interface IDockerContainerPorts {
  IP?: string;
  PrivatePort?: number;
  PublicPort?: number;
  Type?: string; 
}

interface IDockerContainerMounts {
  Type: string;
  Source: string;
  Destination: string;
  Mode: string;
  RW: boolean;
  Propagation: string; 
}

export interface IDockerContainer {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Ports?: IDockerContainerPorts[];
  Labels?: {
    [key: string]: string;
  };
  State: string;
  Status?: string;
  HostConfig?: {
    [key: string]: string;
  };
  NetworkSettings?: {
    [key: string]: any;
  };
  Mounts?: IDockerContainerMounts[]; 
  Config?: any
}

export interface IDockerActor {
  ID: string;
  Attributes: {
    container?: string;
    image?: string;
    name?: string;
    [key: string]: any;
  }
}

export interface IDockerEvent {
  Type: string;
  Action: string;
  Actor: IDockerActor;
  scope: string;
  time: number;
  timeNano: number;
  status?: string;
  id?: string;
  from?: string;
}

export interface IAppContainer {
  id: string;
  name: string;
  image: {
    name: string;
    id: string;
  },
  ports: string[];
  state: string;
  status?: string;
  createdAt: Date;
}