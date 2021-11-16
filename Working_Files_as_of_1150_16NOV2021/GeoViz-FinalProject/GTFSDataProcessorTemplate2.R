###SET THIS STUFF UP BELOW FIRST ##

setwd("C:/Users/jami7880/Downloads/GTFSPan")


install.packages('jsonlite')
install.packages('dplyr')

###                             ####

#Load libraries
library(dplyr)
library(jsonlite)
#Load data from text
stops <- read.csv("stops.txt", sep=",", header=TRUE)
stop_times <- read.csv("stop_times.txt", sep=",", header=TRUE)
routes <- read.csv("routes.txt", sep=",", header=TRUE)
trips <- read.csv("trips.txt", sep=",", header=TRUE)
calendar <- read.csv("calendar.txt", sep=",", header=TRUE)
#Check calendar dates
print(calendar[1:5, 1:6])
mt <- 4
wk <- 5
####################

#Set up frequency dataframe
frequency_stop <- data.frame(stops$stop_name, stops$stop_id, stops$stop_lat, stops$stop_lon)
frequency_stop$freq <- 0
for (row in 1:nrow(stop_times)) {
  row_num <- which(frequency_stop$stops.stop_id == stop_times$stop_id[row])
  frequency_stop$freq[row_num] <- frequency_stop$freq[row_num] + 1
}

# **These are the number of stops at each stop** #

#Set up trips data frame, route id is associated with the number of trips the route has made
trips_traveled <- data.frame(routes$route_id, routes$route_long_name)
trips_traveled$traveled <- 0
for (row in 1:nrow(trips)) {
  row_num <- which(trips_traveled$routes.route_id == trips$route_id[row])
  if(trips$service_id[row] == "MT") {
    print("true")
    trips_traveled$traveled[row_num] <- trips_traveled$traveled[row_num] + (1*mt)
  } else if (trips$service_id[row] == "WK") {
    print("true")
    trips_traveled$traveled[row_num] <- trips_traveled$traveled[row_num] + (1*wk)
  }else {
    trips_traveled$traveled[row_num] <- trips_traveled$traveled[row_num] + 1
  }
  
  
}

##############################################################################

##route identifier#
route_identifier <- data.frame(routes$route_id)
route_identifier$stop_sequence <- c(0)
for (row in 1:nrow(trips)) {
  row_num <- which(trips_traveled$routes.route_id == trips$route_id[row])
  if(trips$service_id[row] == "MT") {
    print("true")
    trips_traveled$traveled[row_num] <- trips_traveled$traveled[row_num] + (1*mt)
  } else if (trips$service_id[row] == "WK") {
    print("true")
    trips_traveled$traveled[row_num] <- trips_traveled$traveled[row_num] + (1*wk)
  }else {
    trips_traveled$traveled[row_num] <- trips_traveled$traveled[row_num] + 1
  }
  
  
}

#Write to JSON
frequency_json <- toJSON(frequency_stop)
trips_json <- toJSON(trips_traveled)  
write(frequency_json, "frequency.json")  
write(trips_json, "trips.json")

