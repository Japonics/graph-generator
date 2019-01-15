import {INode} from './node.interface';

export interface ILink {
  source: INode;
  target: INode;
  left: boolean;
  right: boolean;
}
