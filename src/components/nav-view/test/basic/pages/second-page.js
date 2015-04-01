import {Component, Template, Parent} from 'angular2/angular2'
import {NavView} from 'ionic2/components/nav-view/nav-view'
import {View} from 'ionic2/components/view/view'

@Component({
  selector: 'second-page'
})
@Template({
  url: 'pages/second-page.html',
  directives: [View]
})
export class SecondPage {
  constructor(
    @Parent() navView: NavView
  ) {
    this.navView = navView
  }
  prevPage() {
    this.navView.pop()
  }
}