import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Data } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
 

  pageTitle: string = 'Dashboard'; // Default page title

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Get the active child route's data with a type annotation
        const childRoute = this.getChild(this.activatedRoute);
        if (childRoute && childRoute.snapshot.data) {
          const data = childRoute.snapshot.data as any; // Use 'any' type here
          if (data.title) {
            this.pageTitle = data.title;
          } else {
            this.pageTitle = 'Dashboard'; // Default title
          }
        } else {
          this.pageTitle = 'Dashboard'; // Default title
        }
      }
    });
  }

  // Recursively find the active child route
  private getChild(route: ActivatedRoute): ActivatedRoute {
    if (route.firstChild) {
      return this.getChild(route.firstChild);
    } else {
      return route;
    }
  }

  setPageTitle(title: string) {
    this.pageTitle = title;
  }

  ngOnInit() {}
}
