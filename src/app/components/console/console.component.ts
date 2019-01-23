import {Component, OnInit, OnDestroy, Input, AfterViewInit, HostBinding} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
  animations: [
    trigger('openClose', [
      // ...
      state('open', style({
        bottom: '0px',
        opacity: 1
      })),
      state('closed', style({
        bottom: '-27vh',
        opacity: 0.75
      })),
      transition('* => closed', [
        animate('0.4s')
      ]),
      transition('* => open', [
        animate('0.4s')
      ]),
    ]),
  ]
})
export class ConsoleComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() writter: Subject<HTMLDivElement>;

  public loggerContainer: HTMLElement;

  public opened: boolean = true;

  private _subscriptions: Subscription[] = [];

  private _bufferedElements: HTMLDivElement[] = [];

  @HostBinding('@openClose')
  get isOpened(): string {
    return this.opened ? 'open' : 'closed';
  }

  constructor() {
  }

  public ngOnInit(): void {
    this.subscriptions = this.writter.subscribe((message: HTMLDivElement) => {
      if (this.loggerContainer) {
        this.loggerContainer.append(message);
        return;
      }

      this._bufferedElements.push(message);
    });
  }

  public ngAfterViewInit(): void {
    this.loggerContainer = document.getElementById('logger-container');

    if (this._bufferedElements.length) {
      this._bufferedElements.map(message => {
        this.loggerContainer.append(message);
      });
    }
  }

  public ngOnDestroy(): void {
    this._subscriptions.map(sub => sub.unsubscribe());
  }

  public minimize(): void {
    this.opened = !this.opened;
  }

  public clearConsole(): void {
    if (this.loggerContainer) {
      this.loggerContainer.innerHTML = '';
    }
  }

  set subscriptions(value: Subscription) {
    this._subscriptions.push(value);
  }
}
