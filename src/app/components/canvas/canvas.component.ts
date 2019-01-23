import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input,
  OnDestroy
} from '@angular/core';
import * as d3 from 'd3';
import {IGraphGenerationConfig} from '../../interfaces/graph-generation-config.interface';
import {Subject, Subscription} from 'rxjs';
import {INode} from '../../interfaces/node.interface';
import {ILink} from '../../interfaces/link.interface';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, AfterViewInit, OnDestroy {


  @Input() configReceiver: Subject<IGraphGenerationConfig>;
  @Input() logger: Subject<HTMLDivElement>;
  @Input() onRegenerateNeighborhoodMatrix: Subject<boolean> = new Subject<boolean>();
  @Input() onRegenerateListOfIncidents: Subject<boolean> = new Subject<boolean>();

  @ViewChild('canvas', {read: ElementRef}) canvas: ElementRef;

  private _nodes: INode[] = [];
  private _links: ILink[] = [];
  private _force: any = null;
  private _canvas: any = null;
  private _drag: any = null;

  private _path: any = null;
  private _circle: any = null;
  private _colors: any = null;
  private _selectedNode: any = null;
  private _selectedLink: any = null;
  private _mousedownLink: any = null;
  private _mousedownNode: any = null;
  private _mouseupNode: any = null;
  private _lastKeyDown: any = null;
  private _lastNode: any = null;
  private _lastNodeId: any = null;
  private _dragLine: any = null;

  // noinspection JSMismatchedCollectionQueryUpdate
  private _subscriptions: Subscription[] = [];

  set subscriptions(value: Subscription) {
    this._subscriptions.push(value);
  }

  constructor(private _elementRef: ElementRef) {

  }

  public ngOnInit(): void {
    this.subscriptions = this.configReceiver.subscribe((configuration: IGraphGenerationConfig) => {
      this._prepareRenderConfig(configuration);
    });

    if (this.onRegenerateNeighborhoodMatrix) {
      this.subscriptions = this.onRegenerateNeighborhoodMatrix.subscribe(() => {
        this._prepareNeighborhoodMatrix();
      });
    }

    if (this.onRegenerateListOfIncidents) {
      this.subscriptions = this.onRegenerateListOfIncidents.subscribe(() => {
        this._prepareListOfIncidents();
      });
    }
  }

  public ngAfterViewInit(): void {
    // set up initial nodes and links
    //  - nodes are known by 'id', not by index in array.
    //  - reflexive edges are indicated on the node (as a bold black circle).
    //  - links are always source < target; edge directions are set by 'left' and 'right'.
    this._nodes = [
      {id: 0, reflexive: false},
      {id: 1, reflexive: true},
      {id: 2, reflexive: false},
      {id: 3, reflexive: false},
      {id: 4, reflexive: false},
      {id: 5, reflexive: false},
      {id: 6, reflexive: false},
      {id: 7, reflexive: false},
      {id: 8, reflexive: false},
      {id: 9, reflexive: false}
    ];

    this._links = [
      {source: this._nodes[0], target: this._nodes[1], left: true, right: true},
      {source: this._nodes[1], target: this._nodes[2], left: true, right: true},
      {source: this._nodes[2], target: this._nodes[3], left: true, right: true},
      {source: this._nodes[3], target: this._nodes[4], left: true, right: true},
      {source: this._nodes[4], target: this._nodes[5], left: true, right: true},
      {source: this._nodes[5], target: this._nodes[6], left: true, right: true},
      {source: this._nodes[6], target: this._nodes[7], left: true, right: true},
      {source: this._nodes[7], target: this._nodes[8], left: true, right: true},
      {source: this._nodes[8], target: this._nodes[9], left: true, right: true},
    ];

    this._createCanvas();
    this._prepareNeighborhoodMatrix();
    this._prepareListOfIncidents();
  }

  public ngOnDestroy(): void {
    this._subscriptions.map(sub => sub.unsubscribe());
  }

  private _prepareRenderConfig(config: IGraphGenerationConfig): void {
    const assignedVertex: { [index: number]: number } = {};
    this._nodes = [];
    this._links = [];

    for (let index = 0; index < config.vertex; index++) {
      const node: INode = {
        id: index,
        reflexive: false
      };

      this._nodes.push(node);
    }

    const probability = config.probability / 100;

    for (let currentNode = 0; currentNode < config.vertex; currentNode++) {
      for (let linkNode = 0; linkNode < config.vertex; linkNode++) {
        if (currentNode === linkNode) {
          continue;
        }

        const rand = (Math.floor((Math.random() * 100) + 1)) / 100;
        if (probability > rand) {
          if (assignedVertex[currentNode] === undefined) {
            assignedVertex[currentNode] = 0;
          }

          if (assignedVertex[currentNode] >= config.edges) {
            continue;
          }

          assignedVertex[currentNode]++;

          const link: ILink = {
            source: this._nodes[currentNode],
            target: this._nodes[linkNode],
            left: true,
            right: true
          };

          this._links.push(link);
        }
      }
    }

    this._prepareNeighborhoodMatrix();
    this._prepareListOfIncidents();
    this.restart();
  }

  private _prepareNeighborhoodMatrix(): void {
    const matrix: any = {};
    const tableHeader: HTMLTableSectionElement = document.createElement('thead');
    const tableBody: HTMLTableSectionElement = document.createElement('tbody');

    this._links
      .map(target => {
        if (!matrix[target.target.id]) {
          matrix[target.target.id] = {};
        }

        matrix[target.target.id][target.source.id] = target.left;

      });

    const tableHeaderRow = document.createElement('tr');
    const headerCellSep = document.createElement('td');
    headerCellSep.innerText = '#';
    tableHeaderRow.append(headerCellSep);

    for (let row = 0; row < this._nodes.length; row++) {
      const headerCell = document.createElement('td');
      headerCell.innerText = '' + row;
      tableHeaderRow.append(headerCell);
    }

    tableHeader.append(tableHeaderRow);

    for (let row = 0; row < this._nodes.length; row++) {
      const tableBodyRow = document.createElement('tr');
      const firstCell = document.createElement('td');
      firstCell.innerText = '' + row;
      tableBodyRow.append(firstCell);

      for (let col = 0; col < this._nodes.length; col++) {
        const cell = document.createElement('td');
        if (matrix[row]) {
          if (matrix[row][col]) {
            cell.innerText = '1';
            tableBodyRow.append(cell);
            continue;
          }
        }

        cell.innerText = '0';
        tableBodyRow.append(cell);
      }

      tableBody.append(tableBodyRow);
    }

    const message: HTMLDivElement = document.createElement('div');
    message.className = 'message-container';
    const header = document.createElement('p');
    header.innerText = 'Neighborhood matrix:';
    header.className = 'message-header';
    message.append(header);
    const separator = document.createElement('br');
    message.append(separator);
    const table = document.createElement('table');
    table.append(tableHeader);
    table.append(tableBody);
    message.append(table);

    this.logger.next(message);

    return;
  }

  private _prepareListOfIncidents(): void {
    const matrix: any = {};

    this._links.map(link => {
      if (!matrix[link.source.id]) {
        matrix[link.source.id] = [];
      }

      matrix[link.source.id].push(link.target.id);
    });

    const message = document.createElement('div');
    message.className = 'message-container';
    const header = document.createElement('p');
    header.innerText = 'List of incidents:';
    header.className = 'message-header';
    message.append(header);
    const separator = document.createElement('br');
    message.append(separator);
    const table = document.createElement('table');
    const tableBody = document.createElement('thead');


    for (const id in matrix) {
      if (matrix.hasOwnProperty(id)) {

        const row = document.createElement('tr');

        for (const incident of matrix[id]) {
          const cell = document.createElement('td');
          cell.innerText = incident;
          row.append(cell);
        }

        tableBody.append(row);
      }
    }

    table.append(tableBody);
    message.append(table);

    this.logger.next(message);
  }

  private _createCanvas(): void {

    // set up SVG for D3
    const width = this._elementRef.nativeElement.offsetWidth;
    const height = this._elementRef.nativeElement.offsetHeight;
    this._colors = d3.scaleOrdinal(d3.schemeCategory10);

    this._canvas = d3.select(this.canvas.nativeElement)
      .append('svg')
      .attr('oncontextmenu', 'return false;')
      .attr('width', width)
      .attr('height', height);

    // init D3 force layout
    this._force = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('x', d3.forceX(width / 2))
      .force('y', d3.forceY(height / 2))
      .on('tick', this.tick);

    // init D3 drag support
    this._drag = d3.drag()
      .on('start', (d: any) => {
        if (!d3.event.active) {
          this._force.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (d: any) => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      })
      .on('end', (d: any) => {
        if (!d3.event.active) {
          this._force.alphaTarget(0);
        }

        d.fx = null;
        d.fy = null;
      });

    // define arrow markers for graph links
    this._canvas.append('svg:defs').append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

    this._canvas.append('svg:defs').append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 4)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', '#000');

    // line displayed when dragging new nodes
    this._dragLine = this._canvas.append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');

    // handles to link and node element groups
    this._path = this._canvas.append('svg:g').selectAll('path');
    this._circle = this._canvas.append('svg:g').selectAll('g');

    // mouse event vars
    this._selectedNode = null;
    this._selectedLink = null;
    this._mousedownLink = null;
    this._mousedownNode = null;
    this._mouseupNode = null;

    // only respond once per keydown
    this._lastKeyDown = -1;

    const mousedown: Function = this.mousedown;
    const mousemove: Function = this.mousemove;
    const mouseup: Function = this.mouseup;

    // app starts here
    // this.mousedown
    this._canvas
      .on('mousedown', function () {
        const context = this;
        mousedown(context);
      })
      .on('mousemove', function () {
        const context = this;
        mousemove(context);
      })
      .on('mouseup', function () {
        const context = this;
        mouseup(context);
      });

    d3.select(window)
      .on('keydown', this.keydown)
      .on('keyup', this.keyup);

    this.restart();
  }

  public resetMouseVars = (): void => {
    this._mousedownNode = null;
    this._mouseupNode = null;
    this._mousedownLink = null;
  };

  public keyup = () => {
    this._lastKeyDown = -1;

    // ctrl
    // noinspection JSDeprecatedSymbols
    if (d3.event.keyCode === 17) {
      this._circle.on('.drag', null);
      this._canvas.classed('ctrl', false);
    }
  };

  public keydown = () => {
    d3.event.preventDefault();

    if (this._lastKeyDown !== -1) {
      return;
    }

    // noinspection JSDeprecatedSymbols
    this._lastKeyDown = d3.event.keyCode;

    // ctrl
    // noinspection JSDeprecatedSymbols
    if (d3.event.keyCode === 17) {
      this._circle.call(this._drag);
      this._canvas.classed('ctrl', true);
    }

    if (!this._selectedNode && !this._selectedLink) {
      return;
    }

    // noinspection JSDeprecatedSymbols
    switch (d3.event.keyCode) {
      case 8: // backspace
      case 46: // delete
        if (this._selectedNode) {
          this._nodes.splice(this._nodes.indexOf(this._selectedNode), 1);
          this.spliceLinksForNode(this._selectedNode);
        } else if (this._selectedLink) {
          this._links.splice(this._links.indexOf(this._selectedLink), 1);
        }

        this._selectedLink = null;
        this._selectedNode = null;
        this.restart();
        break;
      case 66: // B
        if (this._selectedLink) {
          // set link direction to both left and right
          this._selectedLink.left = true;
          this._selectedLink.right = true;
        }

        this.restart();
        break;
      case 76: // L
        if (this._selectedLink) {
          // set link direction to left only
          this._selectedLink.left = true;
          this._selectedLink.right = false;
        }

        this.restart();
        break;
      case 82: // R
        if (this._selectedNode) {
          // toggle node reflexivity
          this._selectedNode.reflexive = !this._selectedNode.reflexive;
        } else if (this._selectedLink) {
          // set link direction to right only
          this._selectedLink.left = false;
          this._selectedLink.right = true;
        }

        this.restart();
        break;
    }
  };

  // update force layout (called automatically each iteration)
  public tick = (): void => {
    // draw directed edges with proper padding from node centers
    this._path.attr('d', (d: any) => {
      const deltaX = d.target.x - d.source.x;
      const deltaY = d.target.y - d.source.y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normX = deltaX / dist;
      const normY = deltaY / dist;
      const sourcePadding = d.left ? 17 : 12;
      const targetPadding = d.right ? 17 : 12;
      const sourceX = d.source.x + (sourcePadding * normX);
      const sourceY = d.source.y + (sourcePadding * normY);
      const targetX = d.target.x - (targetPadding * normX);
      const targetY = d.target.y - (targetPadding * normY);

      return `M${sourceX},${sourceY}L${targetX},${targetY}`;
    });

    this._circle.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
  };

  // update graph (called when needed)
  public restart = (): void => {
    this._lastNode = this._nodes[this._nodes.length - 1];
    this._lastNodeId = this._lastNode.id;

    // path (link) group
    this._path = this._path.data(this._links);

    // update existing links
    this._path.classed('selected', (d) => d === this._selectedLink)
      .style('marker-start', (d: any) => d.left ? 'url(#start-arrow)' : '')
      .style('marker-end', (d: any) => d.right ? 'url(#end-arrow)' : '');

    // remove old links
    this._path.exit().remove();

    // add new links
    this._path = this._path.enter().append('svg:path')
      .attr('class', 'link')
      .classed('selected', (d) => d === this._selectedLink)
      .style('marker-start', (d: any) => d.left ? 'url(#start-arrow)' : '')
      .style('marker-end', (d: any) => d.right ? 'url(#end-arrow)' : '')
      .on('mousedown', (d) => {
        if (d3.event.ctrlKey) {
          return;
        }

        // select link
        this._mousedownLink = d;
        this._selectedLink = (this._mousedownLink === this._selectedLink) ? null : this._mousedownLink;
        this._selectedNode = null;
        this.restart();
      })
      .merge(this._path);

    // circle (node) group
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    this._circle = this._circle.data(this._nodes, (d) => d.id);

    // update existing nodes (reflexive & selected visual states)
    this._circle.selectAll('circle')
      .style('fill', (d: any) => (d === this._selectedNode) ? d3.rgb(this._colors(d.id)).brighter().toString() : this._colors(d.id))
      .classed('reflexive', (d: any) => d.reflexive);

    // remove old nodes
    this._circle.exit().remove();

    // add new nodes
    const g = this._circle.enter().append('svg:g');

    g.append('svg:circle')
      .attr('class', 'node')
      .attr('r', 12)
      .style('fill', (d: any) => (d === this._selectedNode) ? d3.rgb(this._colors(d.id)).brighter().toString() : this._colors(d.id))
      .style('stroke', (d: any) => d3.rgb(this._colors(d.id)).darker().toString())
      .classed('reflexive', (d: any) => d.reflexive)
      .on('mouseover', this.onMouseover)
      .on('mouseout', this.onMouseout)
      .on('mousedown', this.onMousedown)
      .on('mouseup', this.onMouseup);

    // show node IDs
    g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text((d: any) => d.id);

    this._circle = g.merge(this._circle);

    // set the graph in motion
    this._force
      .nodes(this._nodes)
      .force('link')['links'](this._links);

    this._force.alphaTarget(0.3).restart();
  };

  public onMouseover = (d): void => {
    if (!this._mousedownNode || d === this._mousedownNode) {
      return;
    }

    // enlarge target node
    // d3.select(this).attr('transform', 'scale(1.1)');
  };

  public onMouseout = (d): void => {
    if (!this._mousedownNode || d === this._mousedownNode) {
      return;
    }

    // unenlarge target node
    // d3.select(this).attr('transform', '');
  };

  public onMousedown = (d): void => {
    if (d3.event.ctrlKey) {
      return;
    }

    // select node
    this._mousedownNode = d;
    this._selectedNode = (this._mousedownNode === this._selectedNode) ? null : this._mousedownNode;
    this._selectedLink = null;

    // reposition drag line
    this._dragLine
      .style('marker-end', 'url(#end-arrow)')
      .classed('hidden', false)
      .attr('d', `M${this._mousedownNode.x},${this._mousedownNode.y}L${this._mousedownNode.x},${this._mousedownNode.y}`);

    this.restart();
  };

  public onMouseup = (d): void => {
    if (!this._mousedownNode) {
      return;
    }

    // needed by FF
    this._dragLine
      .classed('hidden', true)
      .style('marker-end', '');

    // check for drag-to-self
    this._mouseupNode = d;
    if (this._mouseupNode === this._mousedownNode) {
      this.resetMouseVars();
      return;
    }

    // unenlarge target node
    // d3.select(this).attr('transform', '');

    // add link to graph (update if exists)
    // NB: links are strictly source < target; arrows separately specified by booleans
    const isRight = this._mousedownNode.id < this._mouseupNode.id;
    const source = isRight ? this._mousedownNode : this._mouseupNode;
    const target = isRight ? this._mouseupNode : this._mousedownNode;

    const link = this._links.filter((l) => l.source === source && l.target === target)[0];
    if (link) {
      link[isRight ? 'right' : 'left'] = true;
    } else {
      this._links.push({source, target, left: !isRight, right: isRight});
    }

    // select new link
    this._selectedLink = link;
    this._selectedNode = null;
    this.restart();
  };


  public mousedown = (elem): void => {
    // because :active only works in WebKit?
    this._canvas.classed('active', true);

    if (d3.event.ctrlKey || this._mousedownNode || this._mousedownLink) {
      return;
    }

    // insert new node at point
    const point = d3.mouse(elem);

    const node: INode = {
      id: ++this._lastNodeId,
      reflexive: false,
      x: point[0],
      y: point[1]
    };

    this._nodes.push(node);

    this.restart();
  };

  public mousemove = (elem): void => {
    if (!this._mousedownNode) {
      return;
    }

    // update drag line
    this._dragLine.attr('d', `M${this._mousedownNode.x},${this._mousedownNode.y}L${d3.mouse(elem)[0]},${d3.mouse(elem)[1]}`);

    this.restart();
  };

  public mouseup = (): void => {
    if (this._mousedownNode) {
      // hide drag line
      this._dragLine
        .classed('hidden', true)
        .style('marker-end', '');
    }

    // because :active only works in WebKit?
    this._canvas.classed('active', false);

    // clear mouse event vars
    this.resetMouseVars();
  };

  public spliceLinksForNode = (node: INode): void => {
    const toSplice = this._links.filter((l) => l.source === node || l.target === node);

    for (const l of toSplice) {
      this._links.splice(this._links.indexOf(l), 1);
    }
  };
}
