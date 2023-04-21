import React from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import {
  Drawer,
  Box,
  List,
  Divider,
  IconButton,
  Container,
  Link as MUILink,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core'
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  TableChart as TableChartIcon,
  SaveAlt as SaveAltIcon,
  Timeline as TimelineIcon
} from '@material-ui/icons'

import SearchTable from './components/SearchTable'
import SearchRelation from './components/SearchRelation'
import Dashboard from './components/Dashboard'
import Upload from './components/Upload'
import Prioritization from './components/Prioritization'
import NetworkViz from './components/NetworkViz'


const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    //    paddingTop: theme.spacing(4),
    //    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  navLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  appBarImage: {
    maxHeight: '75px',
    paddingRight: '20px',
  },
}))


export default function App() {
  const [open, setOpen] = React.useState(true)
  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }
  const classes = useStyles()

  return (
    <Router>
      <div style={{ 'display': 'flex', 'flexDirection': 'row' }}>

        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
          }}
          open={open}
        >
          <div className={classes.toolbarIcon}>
            {open ? <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton> :
              <IconButton onClick={handleDrawerOpen}>
                <ChevronLeftIcon />
              </IconButton>
            }
          </div>
          <Divider />
          <List>
            <Link to="/" className={classes.navLink}>
              <ListItem button>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
            </Link>

            <Link to="/upload" className={classes.navLink}>
              <ListItem button>
                <ListItemIcon>
                  <SaveAltIcon />
                </ListItemIcon>
                <ListItemText primary="Upload" />
              </ListItem>
            </Link>
            <Link to="/prioritization" className={classes.navLink}>
              <ListItem button>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Prioritization" />
              </ListItem>
            </Link>
            <Link to="/search" className={classes.navLink}>
              <ListItem button>
                <ListItemIcon>
                  <TableChartIcon />
                </ListItemIcon>
                <ListItemText primary="Search" />
              </ListItem>
            </Link>
            <Link to="/searchRelation" className={classes.navLink}>
              <ListItem button>
                <ListItemIcon>
                  <TableChartIcon />
                </ListItemIcon>
                <ListItemText primary="Search Relations" />
              </ListItem>
            </Link>
            <Link to="/network" className={classes.navLink}>
              <ListItem button>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText primary="Network" />
              </ListItem>
            </Link>
          </List>
          <Divider />
        </Drawer>

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route exact path="/upload" component={Upload} />
              <Route exact path="/prioritization" component={Prioritization} />
              <Route exact path="/search" component={SearchTable} />
              <Route exact path="/searchRelation" component={SearchRelation} />
              <Route exact path="/network" component={NetworkViz} />
            </Switch>
          </Container>
        </main>
      </div>
    </Router>
  )
}