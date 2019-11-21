docker build -t thegli/multi-client:latest-gke -t thegli/multi-client:$GIT_SHA -f ./client/Dockerfile ./client
docker build -t thegli/multi-server:latest-gke -t thegli/multi-server:$GIT_SHA -f ./server/Dockerfile ./server
docker build -t thegli/multi-worker:latest-gke -t thegli/multi-worker:$GIT_SHA -f ./worker/Dockerfile ./worker

docker push thegli/multi-client:latest-gke
docker push thegli/multi-client:$GIT_SHA
docker push thegli/multi-server:latest-gke
docker push thegli/multi-server:$GIT_SHA
docker push thegli/multi-worker:latest-gke
docker push thegli/multi-worker:$GIT_SHA

kubectl apply -f ./k8s
kubectl set image deployments/client-deployment client=thegli/multi-client:$GIT_SHA
kubectl set image deployments/server-deployment server=thegli/multi-server:$GIT_SHA
kubectl set image deployments/worker-deployment worker=thegli/multi-worker:$GIT_SHA