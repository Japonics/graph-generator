import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subject, Subscription} from 'rxjs';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit, OnDestroy {

  @Input() writter: Subject<string>;

  public messages: string[] = [];

  private _subscriptions: Subscription[] = [];

  constructor() {
  }

  public ngOnInit(): void {
    this._subscriptions.push(this.writter.subscribe((log: string) => {
      this.messages.push(log);
    }));
  }

  public ngOnDestroy(): void {
    this._subscriptions.map(sub => sub.unsubscribe());
  }
}
