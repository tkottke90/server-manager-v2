#! /bin/bash

if [ -z "$SERVER_HOME" ]; then
  echo "Error: Unset environment variable SERVER_HOME"
  exit 1
fi

create_service() {
  echo "==============================="
  echo
  echo "Service Initializer      "
  echo
  echo "   Service Name: $1"
  echo
  echo "==============================="

  cd $SERVER_HOME/scripts/services

  if [[ ! -f "$SERVER_HOME/scripts/services/$1.service.template"  ]];then
    echo
    echo "- Error: Missing file [$1.template.service]"
    echo
    exit 1
  else
    echo "- Service Template File Found - $1.service.template"
  fi

  echo " - Removing old service file "
  rm -f $1.service


  echo "- Configuring new service file with env variables"
  sed \
    -e "s@#{HOME}@$SERVER_HOME@g"\
    -e "s@#{PATH}@$PATH@g" \
    -e "s@#{USER}@$USER@g" \
    $1.service.template > $1.service

  if [[ ! -f "$SERVER_HOME/scripts/services/$1.service" ]];then
    echo
    echo "- Error: Service File not created [$1.service]"
    echo
    exit 1
  else 
    echo "- Service file created"
  fi

  echo "- Stopping systemctl service $1"
  systemctl disable $1
  systemctl stop $1

  echo "- Removing $1 service from /etc/systemd"
  rm -f /etc/systemd/system/$1.service

  echo "- Copying new service file"
  cp $1.service /etc/systemd/system

  echo "- Starting Service"
  result=$(systemctl start $1)

  if [[ $? -ne 0 ]];then
    echo "Error: Issue starting systemctl: $result"
    journalctl -u get-host.service
    exit $?
  fi


  systemctl enable $1

  echo "Complete!"
  return
}

create_service get-host