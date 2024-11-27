MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==BOUNDARY=="

--==BOUNDARY==
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
set -ex
/etc/eks/bootstrap.sh ${cluster_name} \
  --b64-cluster-ca ${cluster_auth_base64} \
  --apiserver-endpoint ${cluster_endpoint} \
  ${bootstrap_extra_args}

--==BOUNDARY==--