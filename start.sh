#!/bin/bash
initFlag="/var/init_flag_20220625"
if test -e $initFlag
then
    echo 'Start script has already been run! will pass!'
    exit
fi
rm -rf /var/lib/docker/containers/*
#配置SSH
sed -i '/PasswordAuthentication/ c PasswordAuthentication yes' /etc/ssh/sshd_config
sed -i '/PermitRootLogin/ c PermitRootLogin yes' /etc/ssh/sshd_config
/etc/init.d/ssh restart
#安装DOCKER
apt-get update
apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common expect
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io expect
/usr/bin/expect <<-EOF
spawn docker login
expect {
"Username*" { send "newspappers\r"; exp_continue }
"Password" { send "P97zmkHsk2f\r"}
}
expect eof
EOF
mkdir -p /var/waweb/.wwebjs_auth
mkdir -p /var/waweb/.config
chown -R ubuntu:ubuntu /var/waweb

docker ps -aq | xargs docker rm -f
docker images -aq | xargs docker rmi

docker run -d --restart always --cap-add=SYS_ADMIN --mount type=bind,source=/var/waweb/.wwebjs_auth,target=/home/chrome/wacheck/.wwebjs_auth --mount type=bind,source=/var/waweb/.config/,target=/home/chrome/wacheck/.config/  newspappers/waweb:latest
#设置ROOT账户密码
/usr/bin/expect <<-EOF
spawn sudo passwd root
expect {
"Enter new UNIX password*" { send "P97zmkHsk2f\r"; exp_continue }
"Retype*" { send "P97zmkHsk2f\r"}
}
expect eof
EOF

touch $initFlag

